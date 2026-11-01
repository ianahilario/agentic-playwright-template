import { defineConfig } from 'playwright-smart-runner';

export default defineConfig({
  testDir: './src/tests',
  baseBranch: 'main',
  ignorePaths: ['**/*.md', '.cursor/**', '.claude/**', '.agents/**'],
  passWithNoMappedTest: true,
  runChangedTests: true,
  unmappedChangeRun: ['@smoke'],
  runMapping: [
    {
      changedPaths: [
        'src/page-objects/pages/login-page.ts',
        'src/page-objects/pages/products-page.ts',
      ],
      runTests: ['src/tests/login/valid-credentials.spec.ts'],
    },
  ],
});
