import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch user's chunks and projects
    const [chunks, projects] = await Promise.all([
        prisma.chunk.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        }),
        prisma.project.findMany({
            where: { userId: session.user.id },
            include: { chunk: true },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    // Get API key
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { apiKey: true },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Navigation */}
            <nav className="flex items-center justify-between p-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">⚓</span>
                    <span className="text-xl font-bold text-white">Harbor</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-400">{session.user.email}</span>
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}
                    >
                        <button
                            type="submit"
                            className="px-4 py-2 text-slate-400 hover:text-white transition"
                        >
                            Sign out
                        </button>
                    </form>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome, {session.user.name?.split(" ")[0] || "Developer"}!
                </h1>
                <p className="text-slate-400 mb-12">
                    Manage your projects and devices from here.
                </p>

                {/* API Key Section */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Your API Key</h2>
                    <div className="flex items-center gap-4">
                        <code className="flex-1 bg-slate-900 px-4 py-3 rounded-lg text-slate-300 font-mono text-sm">
                            {user?.apiKey}
                        </code>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition">
                            Copy
                        </button>
                    </div>
                    <p className="text-slate-500 text-sm mt-3">
                        Add this to your IDE settings to deploy from Cursor, VS Code, etc.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Projects Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">My Apps</h2>
                            <Link
                                href="/projects/new"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
                            >
                                + Deploy New App
                            </Link>
                        </div>

                        {projects.length === 0 ? (
                            <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-2xl p-12 text-center">
                                <div className="text-4xl mb-4">🚀</div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    No apps yet
                                </h3>
                                <p className="text-slate-400 mb-6">
                                    Deploy your first app from your IDE or create one here.
                                </p>
                                <Link
                                    href="/projects/new"
                                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition"
                                >
                                    Create First App
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">
                                                    {project.name}
                                                </h3>
                                                {project.githubRepoName ? (
                                                    <p className="text-slate-400 text-sm flex items-center gap-1">
                                                        <span>📁</span> {project.githubRepoName}
                                                        {project.githubBranch && <span className="text-slate-500">({project.githubBranch})</span>}
                                                    </p>
                                                ) : (
                                                    <p className="text-slate-500 text-sm">No GitHub repo linked</p>
                                                )}
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === "running"
                                                    ? "bg-green-600/20 text-green-400"
                                                    : "bg-slate-600/20 text-slate-400"
                                                    }`}
                                            >
                                                {project.status === "running" ? "🟢 Live" : "⚫ Stopped"}
                                            </span>
                                        </div>
                                        {project.tunnelUrl && (
                                            <p className="text-blue-400 text-sm mt-2 truncate">
                                                🌐 {project.tunnelUrl}
                                            </p>
                                        )}
                                        {project.chunk && (
                                            <p className="text-slate-500 text-sm mt-1">
                                                Running on: {project.chunk.name}
                                            </p>
                                        )}
                                        <div className="flex gap-3 mt-4">
                                            {project.tunnelUrl ? (
                                                <a
                                                    href={project.tunnelUrl}
                                                    target="_blank"
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition"
                                                >
                                                    Open App
                                                </a>
                                            ) : (
                                                <button
                                                    className="px-4 py-2 bg-slate-700 text-slate-400 rounded-lg text-sm cursor-not-allowed"
                                                    disabled
                                                >
                                                    Not Running
                                                </button>
                                            )}
                                            <Link
                                                href={`/projects/${project.id}`}
                                                className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 rounded-lg text-sm transition"
                                            >
                                                Manage
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chunks Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">My Devices</h2>
                            <button className="px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 rounded-lg text-sm font-medium transition">
                                + Add Device
                            </button>
                        </div>

                        {chunks.length === 0 ? (
                            <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-2xl p-12 text-center">
                                <div className="text-4xl mb-4">💻</div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    No devices connected
                                </h3>
                                <p className="text-slate-400 mb-6">
                                    Install HarborFlow on your laptop or PC to get started.
                                </p>
                                <button className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition">
                                    Download HarborFlow
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {chunks.map((chunk) => (
                                    <div
                                        key={chunk.id}
                                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">💻</span>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {chunk.name}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm">
                                                        Last seen:{" "}
                                                        {chunk.lastSeen
                                                            ? new Date(chunk.lastSeen).toLocaleString()
                                                            : "Never"}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${chunk.status === "online"
                                                    ? "bg-green-600/20 text-green-400"
                                                    : "bg-red-600/20 text-red-400"
                                                    }`}
                                            >
                                                {chunk.status === "online" ? "🟢 Online" : "🔴 Offline"}
                                            </span>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Storage</span>
                                                <span className="text-slate-300">
                                                    0 / {chunk.storage} GB
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full w-0"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
