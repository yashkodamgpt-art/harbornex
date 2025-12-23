#!/usr/bin/env node
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const program = new Command();

const { startDaemon } = require('../src/daemon');
const { startTunnel } = require('../src/tunnel');
const { setApiKey, getApiKey, loadConfig, CONFIG_FILE, setApiUrl } = require('../src/config');
const { registerChunk, listChunks, listProjects, sendHeartbeat } = require('../src/api');
const { detectProjectType } = require('../src/detect');
const { runProject, cloneFromGitHub } = require('../src/runner');

program
  .name('nexflow')
  .description('NexFlow - Turn any computer into your cloud (Part of HarborNex)')
  .version('1.0.0');

// Login
program.command('login')
  .description('Configure your NexCloud API key')
  .argument('<api-key>', 'Your API key from app.harbornex.dev')
  .action((apiKey) => {
    setApiKey(apiKey);
    console.log(chalk.green('✓ API key saved!'));
    console.log(chalk.cyan('\nNext: Run `nexflow register` to connect this device.'));
  });

// Connect (set cloud URL)
program.command('connect')
  .description('Set the NexCloud server URL')
  .argument('<url>', 'NexCloud URL (e.g., https://app.harbornex.dev)')
  .action((url) => {
    setApiUrl(url);
    console.log(chalk.green(`✓ Connected to: ${url}`));
    console.log(chalk.cyan('\nNext: Run `nexflow login <api-key>` to authenticate.'));
  });

// Config
program.command('config')
  .description('Show current configuration')
  .action(() => {
    const config = loadConfig();
    console.log(chalk.bold('\n⚓ NexFlow Configuration:\n'));
    console.log(`  Cloud URL:  ${chalk.blue(config.apiUrl)}`);
    console.log(`  API Key:    ${config.apiKey ? chalk.green('configured') : chalk.red('not set')}`);
    console.log(`  Chunk Name: ${chalk.white(config.chunkName)}`);
    console.log(`  Config: ${chalk.dim(CONFIG_FILE)}`);
  });

// Register
program.command('register')
  .description('Register this device with Harbor Cloud')
  .action(async () => {
    const spinner = ora('Registering device...').start();
    try {
      const result = await registerChunk();
      spinner.succeed('Device registered!');
      console.log(chalk.green(`\n✓ "${result.chunk.name}" is now online`));
    } catch (error) {
      spinner.fail(`Registration failed: ${error.message}`);
    }
  });

// Deploy
program.command('deploy')
  .description('Deploy a project from current directory')
  .option('-p, --path <path>', 'Path to project', '.')
  .action(async (options) => {
    const projectPath = path.resolve(options.path);

    console.log(chalk.bold('\n🚀 Harbor Deploy\n'));
    console.log(chalk.dim(`Project: ${projectPath}\n`));

    // Detect project type
    const spinner = ora('Detecting project type...').start();
    const projectInfo = detectProjectType(projectPath);

    if (projectInfo.type === 'unknown') {
      spinner.fail('Could not detect project type');
      console.log(chalk.yellow('\nMake sure your project has a package.json or index.html'));
      return;
    }

    spinner.succeed(`Detected: ${chalk.cyan(projectInfo.type)}`);
    console.log(chalk.dim(`  Start: ${projectInfo.startCmd}`));
    console.log(chalk.dim(`  Port: ${projectInfo.port}\n`));

    // Run the project
    try {
      const result = await runProject(projectPath, projectInfo, (msg) => {
        console.log(chalk.dim(msg));
      });

      console.log(chalk.green('\n✓ App is running!'));
      console.log(chalk.bold.white(`\n   🌐 ${result.url}\n`));
      console.log(chalk.dim('Press Ctrl+C to stop.\n'));

      process.on('SIGINT', () => {
        console.log(chalk.yellow('\nStopping...'));
        result.process.kill();
        process.exit(0);
      });
    } catch (error) {
      console.log(chalk.red(`\n✗ Deploy failed: ${error.message}`));
    }
  });

// Start daemon
program.command('start')
  .description('Start HarborFlow daemon')
  .action(async () => {
    console.log(chalk.yellow('Starting HarborFlow...'));

    const spinner = ora('Connecting...').start();
    try {
      await registerChunk();
      spinner.succeed('Connected to Harbor Cloud');
    } catch (error) {
      spinner.fail(`Connection failed: ${error.message}`);
      return;
    }

    console.log(chalk.green('\n🚀 HarborFlow is running!'));
    console.log(chalk.dim('   Press Ctrl+C to stop.\n'));

    const heartbeatInterval = setInterval(async () => {
      try {
        await sendHeartbeat();
        console.log(chalk.dim(`   ♥ ${new Date().toLocaleTimeString()}`));
      } catch (e) {
        console.log(chalk.yellow(`   ⚠ ${e.message}`));
      }
    }, 30000);

    await startDaemon();

    process.on('SIGINT', () => {
      clearInterval(heartbeatInterval);
      console.log(chalk.green('\nGoodbye!'));
      process.exit(0);
    });
  });

// Status
program.command('status')
  .description('Show status')
  .action(async () => {
    console.log(chalk.bold('\n📊 Status\n'));
    const config = loadConfig();
    console.log(`  Device: ${chalk.white(config.chunkName)}`);
    console.log(`  API: ${config.apiKey ? chalk.green('connected') : chalk.red('not configured')}`);

    if (config.apiKey) {
      try {
        const [chunks, projects] = await Promise.all([
          listChunks().catch(() => ({ chunks: [] })),
          listProjects().catch(() => ({ projects: [] })),
        ]);
        console.log(`  Devices: ${chalk.cyan(chunks.chunks?.length || 0)}`);
        console.log(`  Projects: ${chalk.cyan(projects.projects?.length || 0)}`);
      } catch (e) { }
    }
    console.log('');
  });

// Tunnel
program.command('tunnel')
  .description('Create public URL for a local port')
  .argument('<port>', 'Port to expose')
  .action(async (port) => {
    console.log(chalk.cyan(`Starting tunnel for port ${port}...`));
    const url = await startTunnel(port);
    console.log(chalk.green(`\n🚀 Tunnel Live!`));
    console.log(chalk.bold.white(`\n   ${url}\n`));
  });

// Deploy from GitHub
program.command('deploy-git')
  .description('Deploy a project from GitHub')
  .argument('<repo-url>', 'GitHub repository URL')
  .option('-b, --branch <branch>', 'Branch to deploy', 'main')
  .option('-n, --name <name>', 'Project name/ID')
  .action(async (repoUrl, options) => {
    console.log(chalk.bold('\n🚀 Harbor Deploy from GitHub\n'));
    console.log(chalk.dim(`Repo: ${repoUrl}`));
    console.log(chalk.dim(`Branch: ${options.branch}\n`));

    // Generate project ID from repo name
    const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'project';
    const projectId = options.name || repoName;

    try {
      // Clone/pull from GitHub
      const projectDir = await cloneFromGitHub(repoUrl, options.branch, projectId, (msg) => {
        console.log(chalk.dim(msg));
      });

      console.log(chalk.green(`✓ Code ready at ${projectDir}\n`));

      // Detect project type
      const spinner = ora('Detecting project type...').start();
      const projectInfo = detectProjectType(projectDir);

      if (projectInfo.type === 'unknown') {
        spinner.fail('Could not detect project type');
        console.log(chalk.yellow('\nMake sure your project has a package.json or index.html'));
        return;
      }

      spinner.succeed(`Detected: ${chalk.cyan(projectInfo.type)}`);
      console.log(chalk.dim(`  Start: ${projectInfo.startCmd}`));
      console.log(chalk.dim(`  Port: ${projectInfo.port}\n`));

      // Run the project
      const result = await runProject(projectDir, projectInfo, (msg) => {
        console.log(chalk.dim(msg));
      });

      console.log(chalk.green('\n✓ App is running!'));
      console.log(chalk.bold.white(`\n   🌐 ${result.url}\n`));
      console.log(chalk.dim('Press Ctrl+C to stop.\n'));

      process.on('SIGINT', () => {
        console.log(chalk.yellow('\nStopping...'));
        result.process.kill();
        process.exit(0);
      });
    } catch (error) {
      console.log(chalk.red(`\n✗ Deploy failed: ${error.message}`));
    }
  });

program.parse();

