#!/usr/bin/env node

/**
 * Universal Uvicorn Proxy Runner
 * ==============================
 * This script ensures that when Render or other Node-based container environments
 * execute 'uvicorn app.main:app --host 0.0.0.0 --port $PORT', it automatically
 * delegates to python3 -m uvicorn, ensuring dependencies are installed and starting
 * the FastAPI server cleanly.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const pythonBin = process.platform === 'win32' ? 'python' : 'python3';
const pipBin = process.platform === 'win32' ? 'pip' : 'pip3';

// 1. Verify python environment has uvicorn module
try {
  execSync(`${pythonBin} -c "import uvicorn"`, { stdio: 'ignore' });
} catch (e) {
  console.log('[Runner] uvicorn python module not detected in system. Installing backend requirements...');
  const reqPath = fs.existsSync(path.join(__dirname, '..', 'requirements.txt'))
    ? path.join(__dirname, '..', 'requirements.txt')
    : path.join(__dirname, '..', 'backend', 'requirements.txt');

  try {
    execSync(`${pipBin} install -r "${reqPath}"`, { stdio: 'inherit' });
  } catch (err) {
    console.log('[Runner] Attempting fallback pip install for uvicorn and fastapi...');
    execSync(`${pipBin} install uvicorn[standard] fastapi`, { stdio: 'inherit' });
  }
}

// 2. Forward execution to python -m uvicorn
const uvicornArgs = ['-m', 'uvicorn', ...process.argv.slice(2)];
console.log(`[Runner] Launching: ${pythonBin} ${uvicornArgs.join(' ')}`);

const child = spawn(pythonBin, uvicornArgs, {
  stdio: 'inherit',
  env: process.env,
  cwd: path.resolve(__dirname, '..')
});

child.on('error', (err) => {
  console.error('[Runner] Error spawning python process:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
