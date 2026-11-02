#!/usr/bin/env tsx

import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';

const UI_PROJECTS = ['desktop-chrome', 'mobile-chrome'] as const;

type CommandFailure = {
  stderr?: string | Uint8Array;
  status?: number | null;
};

function isCommandFailure(error: unknown): error is CommandFailure {
  return typeof error === 'object' && error !== null;
}

function unquote(line: string): string {
  if (line.startsWith("'") && line.endsWith("'") && line.length >= 2) {
    return line.slice(1, -1).replaceAll("'\\''", "'");
  }
  return line;
}

function selectedTests(): string[] {
  const runner = path.join(__dirname, '..', 'node_modules', '.bin', 'playwright-smart-runner');
  let output: string;
  try {
    output = execFileSync(runner, ['--list'], {
      encoding: 'utf8',
    });
  } catch (error: unknown) {
    if (isCommandFailure(error) && error.stderr) process.stderr.write(error.stderr);
    process.exit(isCommandFailure(error) ? (error.status ?? 1) : 1);
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

ui.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
