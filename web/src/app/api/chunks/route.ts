import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/chunks/register - HarborFlow registers a new chunk
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { apiKey, name, storage, ram, cpu } = body;

        if (!apiKey || !name) {
            return NextResponse.json(
                { error: "apiKey and name are required" },
                { status: 400 }
            );
        }

        // Find user by API key
        const user = await prisma.user.findUnique({
            where: { apiKey },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid API key" },
                { status: 401 }
            );
        }

        // Create or update chunk
        const chunk = await prisma.chunk.upsert({
            where: {
                id: `${user.id}-${name}`, // Composite key concept
            },
            update: {
                status: "online",
                storage: storage || 0,
                ram: ram || 0,
                cpu: cpu || 0,
                lastSeen: new Date(),
            },
            create: {
                name,
                userId: user.id,
                status: "online",
                storage: storage || 0,
                ram: ram || 0,
                cpu: cpu || 0,
                lastSeen: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            chunk: {
                id: chunk.id,
                name: chunk.name,
                status: chunk.status,
            },
        });
    } catch (error) {
        console.error("Chunk registration error:", error);
        return NextResponse.json(
            { error: "Failed to register chunk" },
            { status: 500 }
        );
    }
}

// GET /api/chunks - List user's chunks (requires API key in header)
export async function GET(request: NextRequest) {
    try {
        const apiKey = request.headers.get("x-api-key");

        if (!apiKey) {
            return NextResponse.json(
                { error: "API key required in x-api-key header" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { apiKey },
            include: { chunks: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid API key" },
                { status: 401 }
            );
        }

        return NextResponse.json({ chunks: user.chunks });
    } catch (error) {
        console.error("Chunk list error:", error);
        return NextResponse.json(
            { error: "Failed to list chunks" },
            { status: 500 }
        );
    }
}
