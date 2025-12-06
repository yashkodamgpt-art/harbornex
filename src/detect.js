const fs = require('fs');
const path = require('path');

// Load harbor.json config if exists
function loadHarborConfig(projectPath) {
    const configPath = path.join(projectPath, 'harbor.json');
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log(`[Harbor] Found harbor.json: ${config.name || 'unnamed'}`);
            return config;
        } catch (e) {
            console.error('[Harbor] Error reading harbor.json:', e.message);
            return null;
        }
    }
    return null;
}

// Detect project type - uses harbor.json if present, otherwise auto-detects
function detectProjectType(projectPath) {
    // First, check for harbor.json
    const harborConfig = loadHarborConfig(projectPath);
    if (harborConfig) {
        return {
            type: harborConfig.framework || 'custom',
            startCmd: harborConfig.start?.command || 'npm start',
            buildCmd: harborConfig.build?.command || null,
            port: harborConfig.start?.port || 3000,
            harborConfig, // Include full config for advanced features
        };
    }

    // Auto-detect based on files
    const files = fs.readdirSync(projectPath);

    // Check for package.json (Node.js project)
    if (files.includes('package.json')) {
        const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));

        // Check for specific frameworks
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps['next']) return { type: 'nextjs', startCmd: 'npm run start', buildCmd: 'npm run build', port: 3000 };
        if (deps['nuxt']) return { type: 'nuxt', startCmd: 'npm run start', buildCmd: 'npm run build', port: 3000 };
        if (deps['vite']) return { type: 'vite', startCmd: 'npm run preview', buildCmd: 'npm run build', port: 4173 };
        if (deps['express']) return { type: 'express', startCmd: 'node index.js', buildCmd: null, port: 3000 };
        if (deps['fastify']) return { type: 'fastify', startCmd: 'node index.js', buildCmd: null, port: 3000 };

        // Check for start script
        if (pkg.scripts?.start) {
            return { type: 'node', startCmd: 'npm start', buildCmd: pkg.scripts.build ? 'npm run build' : null, port: 3000 };
        }

        // Check for main entry
        if (pkg.main) {
            return { type: 'node', startCmd: `node ${pkg.main}`, buildCmd: null, port: 3000 };
        }

        return { type: 'node', startCmd: 'npm start', buildCmd: null, port: 3000 };
    }

    // Check for Python
    if (files.includes('requirements.txt') || files.includes('Pipfile')) {
        if (files.includes('manage.py')) {
            return { type: 'django', startCmd: 'python manage.py runserver 0.0.0.0:8000', buildCmd: null, port: 8000 };
        }
        if (files.some(f => f.endsWith('.py'))) {
            return { type: 'python', startCmd: 'python app.py', buildCmd: null, port: 5000 };
        }
    }

    // Check for static site
    if (files.includes('index.html')) {
        return { type: 'static', startCmd: 'npx serve -s . -l 3000', buildCmd: null, port: 3000 };
    }

    // Default
    return { type: 'unknown', startCmd: null, buildCmd: null, port: 3000 };
}

// Get files to include (uses harbor.json ignore/include if present)
function getDeployFiles(projectPath) {
    const harborConfig = loadHarborConfig(projectPath);

    let ignore = [
        'node_modules',
        '.git',
        '.env',
        '.env.local',
        '.next',
        'dist',
        '.cache',
        '*.log',
        '.DS_Store',
        'Thumbs.db',
    ];

    // Add custom ignores from harbor.json
    if (harborConfig?.ignore) {
        ignore = [...ignore, ...harborConfig.ignore];
    }

    function shouldIgnore(name) {
        return ignore.some(pattern => {
            if (pattern.startsWith('*')) {
                return name.endsWith(pattern.slice(1));
            }
            return name === pattern;
        });
    }

    function walkDir(dir, baseDir = dir) {
        const files = [];
        const items = fs.readdirSync(dir);

        for (const item of items) {
            if (shouldIgnore(item)) continue;

            const fullPath = path.join(dir, item);
            const relativePath = path.relative(baseDir, fullPath);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...walkDir(fullPath, baseDir));
            } else {
                files.push({ path: fullPath, name: relativePath });
            }
        }

        return files;
    }

    return walkDir(projectPath);
}

module.exports = {
    detectProjectType,
    getDeployFiles,
    loadHarborConfig,
};

