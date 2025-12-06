import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects/[id]/deployments - Get deployments
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const project = await prisma.project.findFirst({
            where: {
                id,
                user: { email: session.user.email },
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const deployments = await prisma.deployment.findMany({
            where: { projectId: id },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        return NextResponse.json({ deployments });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch deployments" }, { status: 500 });
    }
}

// POST /api/projects/[id]/deployments - Trigger new deployment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const project = await prisma.project.findFirst({
            where: {
                id,
                user: { email: session.user.email },
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const lastDeployment = await prisma.deployment.findFirst({
            where: { projectId: id },
            orderBy: { version: "desc" },
        });

        const nextVersion = (lastDeployment?.version || 0) + 1;

        const deployment = await prisma.deployment.create({
            data: {
                projectId: id,
                version: nextVersion,
                status: "pending",
                branch: project.githubBranch || "main",
            },
        });

        // Simulate build process (in real system, this would trigger actual build)
        setTimeout(async () => {
            try {
                await prisma.deployment.update({
                    where: { id: deployment.id },
                    data: {
                        status: "building",
                        buildLogs: "Installing dependencies...\nnpm install\n",
                    },
                });

                setTimeout(async () => {
                    try {
                        await prisma.deployment.update({
                            where: { id: deployment.id },
                            data: {
                                status: "success",
                                duration: Math.floor(Math.random() * 60) + 30,
                                buildLogs:
                                    "Installing dependencies...\nnpm install\n✓ Installed 245 packages\n\nBuilding...\nnpm run build\n✓ Build complete\n\nDeploying...\n✓ Deployed successfully!",
                                url: project.tunnelUrl,
                            },
                        });
                    } catch (e) {
                        console.error("Failed to update deployment:", e);
                    }
                }, 3000);
            } catch (e) {
                console.error("Failed to update deployment:", e);
            }
        }, 1000);

        return NextResponse.json({ deployment });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create deployment" }, { status: 500 });
    }
}
