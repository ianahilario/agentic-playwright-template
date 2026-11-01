#!/usr/bin/env node

const { execFileSync, spawn } = require('child_process');
const path = require('path');

const UI_PROJECTS = ['desktop-chrome', 'mobile-chrome'];

function unquote(line) {
  if (line.startsWith("'") && line.endsWith("'") && line.length >= 2) {
    return line.slice(1, -1).replaceAll("'\\''", "'");
  }
  return line;
}

function selectedTests() {
  const runner = path.join(__dirname, '..', 'node_modules', '.bin', 'playwright-smart-runner');
  let output;
  try {
    output = execFileSync(runner, ['--list'], {
      encoding: 'utf8',
    });
  } catch (error) {
    if (error.stderr) process.stderr.write(error.stderr);
    process.exit(error.status ?? 1);
  }

  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(unquote);
}

const tests = selectedTests();

if (tests.length === 0) {
  console.error('No tests selected.');
  process.exit(1);
}

const playwright = path.join(__dirname, '..', 'node_modules', '.bin', 'playwright');
const args = [
  'test',
  ...tests,
  ...UI_PROJECTS.flatMap((project) => ['--project', project]),
  '--ui',
];

console.log(`Opening ${tests.length} selected test(s) in the UI runner.`);

const ui = spawn(playwright, args, {
  stdio: 'inherit',
});

ui.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
