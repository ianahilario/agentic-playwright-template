const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildPrompt,
  closeComment,
  collectFromReport,
  decideClosures,
  formatSgt,
  normalizeError,
  parseCursorOutput,
  parseGhList,
  planApply,
  splitGroups,
  updateIssueBody,
} = require('./playwright-failure-issues.cjs');

const context = {
  serverUrl: 'https://github.com',
  repository: 'acme/shop',
  runId: '99',
  runUrl: 'https://github.com/acme/shop/actions/runs/99',
  runName: 'Nightly',
  sha: 'abc123',
};

const file = 'src/tests/login/wrong-password.spec.ts';

function failedTest(project, message, extra = {}) {
  return {
    projectName: project,
    status: 'unexpected',
    annotations: extra.annotations || [
      { type: 'scenario', description: 'GIVEN the sign-in screen is open' },
      { type: 'feature', description: 'login' },
    ],
    results: [
      {
        status: 'failed',
        retry: extra.retry || 0,
        startTime: extra.startTime || '2026-11-01T14:34:00.000Z',
        error: { message },
      },
    ],
  };
}

function spec(title, tests, extra = {}) {
  return { title, file: extra.file || file, line: extra.line || 4, tests };
}

test('formats timestamps in Hong Kong time', () => {
  assert.equal(formatSgt('2026-11-01T14:34:00.000Z'), '2026-11-01 22:34:00 SGT');
  assert.equal(formatSgt('not-a-date'), null);
});

test('normalizes the first error line', () => {
  const ansi = `${String.fromCharCode(27)}[31m`;
  const first = normalizeError(
    `${ansi}Error: timed out https://example.com/a/1234567890 uuid 123e4567-e89b-12d3-a456-426614174000\nnext line`,
  );
  const second = normalizeError('Error: timed out https://example.com/b/99999999');
  assert.equal(first, 'Error: timed out uuid');
  assert.equal(second, 'Error: timed out');
  assert.equal(normalizeError('   '), 'Unknown failure');
});

test('groups final failures and keeps passing tests out of the groups', () => {
  const report = {
    stats: { unexpected: 3, startTime: '2026-11-01T14:00:00.000Z' },
    suites: [
      {
        title: file,
        file,
        specs: [
          spec('[LOGIN-04] Login > User > cannot sign in', [
            failedTest('desktop-chrome', 'Error: credentials were rejected'),
            failedTest(
              'mobile-chrome',
              'Error: credentials were rejected\nhttps://www.saucedemo.com/',
            ),
          ]),
        ],
        suites: [
          {
            title: 'wrong password',
            specs: [spec('shows an error', [failedTest('desktop-chrome', 'Error: other')])],
          },
        ],
      },
    ],
  };
  report.suites[0].specs.push(
    spec('already green', [
      {
        projectName: 'desktop-chrome',
        status: 'expected',
        results: [{ status: 'passed', startTime: '2026-11-01T14:34:00.000Z' }],
      },
      {
        projectName: 'mobile-chrome',
        status: 'flaky',
        results: [
          { status: 'failed', retry: 0, error: { message: 'Error: blip' } },
          { status: 'passed', retry: 1, startTime: '2026-11-01T14:34:00.000Z' },
        ],
      },
    ]),
  );

  const payload = collectFromReport(report, context);
  assert.equal(payload.groups.length, 2);
  assert.equal(payload.groups[0].testCount, 2);
  assert.equal(payload.groups[0].errorKey, 'Error: credentials were rejected');
  assert.equal(payload.groups[0].tests[0].name, '[LOGIN-04] Login > User > cannot sign in');
  assert.equal(payload.groups[0].tests[0].scenario, 'GIVEN the sign-in screen is open');
  assert.equal(
    payload.groups[0].tests[0].specUrl,
    `https://github.com/acme/shop/blob/abc123/${file}#L4`,
  );
  assert.equal(payload.groups[0].firstFailedAt, '2026-11-01 22:34:00 SGT');
  assert.equal(payload.groups[1].tests[0].name, 'wrong password › shows an error');
  assert.equal(payload.launchResults.filter((row) => row.status === 'passed').length, 1);
  assert.equal(payload.launchResults.filter((row) => row.status === 'flaky').length, 1);
  assert.equal(payload.failedTestCount, 3);
});

test('uses the last attempt when a test fails after retry', () => {
  const report = {
    stats: { unexpected: 1 },
    suites: [
      {
        title: file,
        file,
        specs: [
          spec('times out', [
            {
              projectName: 'desktop-chrome',
              status: 'unexpected',
              results: [
                {
                  retry: 0,
                  error: { message: 'Error: first' },
                  startTime: '2026-11-01T14:00:00.000Z',
                },
                {
                  retry: 1,
                  error: { message: 'Error: second' },
                  startTime: '2026-11-01T14:10:00.000Z',
                },
                {
                  retry: 2,
                  error: { message: 'Error: final failure' },
                  startTime: '2026-11-01T14:34:00.000Z',
                },
              ],
            },
          ]),
        ],
      },
    ],
  };
  const payload = collectFromReport(report, context);
  assert.equal(payload.groups.length, 1);
  assert.equal(payload.groups[0].errorKey, 'Error: final failure');
  assert.equal(payload.groups[0].tests[0].retry, 2);
});

test('keeps a deferred failure from closing its issue', () => {
  const report = {
    suites: [
      {
        title: file,
        file,
        specs: [
          spec('one', [
            failedTest('desktop-chrome', 'Error: one'),
            failedTest('mobile-chrome', 'Error: one'),
          ]),
          spec('two', [failedTest('desktop-chrome', 'Error: two')]),
          spec('three', [failedTest('desktop-chrome', 'Error: three')]),
        ],
      },
    ],
  };
  const payload = collectFromReport(report, context, { maxGroups: 1 });
  assert.equal(payload.groups.length, 1);
  assert.equal(payload.groups[0].errorKey, 'Error: one');
  assert.equal(payload.deferredGroupCount, 2);
  assert.equal(payload.failedFingerprints.length, 4);

  const deferred = payload.failedFingerprints.find((item) => item.endsWith('::two'));
  const decision = decideClosures(payload, [
    { number: 7, title: 'old', body: `<!-- playwright-fingerprint: ${deferred} -->` },
  ]);
  assert.equal(decision.toClose.length, 0);
  assert.equal(decision.kept[0].reason, 'still failing');
});

test('throws when the report count and the parsed failures disagree', () => {
  assert.throws(
    () =>
      collectFromReport(
        {
          stats: { unexpected: 2 },
          suites: [
            {
              title: file,
              file,
              specs: [spec('one', [failedTest('desktop-chrome', 'Error: one')])],
            },
          ],
        },
        context,
      ),
    /parser found 1/,
  );
});

test('assigns an existing issue by fingerprint and leaves unknown tests new', () => {
  const payload = collectFromReport(
    {
      suites: [
        {
          title: file,
          file,
          specs: [
            spec('same', [
              failedTest('desktop-chrome', 'Error: same'),
              failedTest('mobile-chrome', 'Error: same'),
            ]),
          ],
        },
      ],
    },
    context,
  );
  const [desktop, mobile] = payload.groups[0].tests;
  const split = splitGroups(payload, [
    { number: 8, title: 'later', body: `<!-- playwright-fingerprint: ${desktop.fingerprint} -->` },
    {
      number: 2,
      title: 'earlier',
      body: `<!-- playwright-fingerprint: ${desktop.fingerprint} -->`,
    },
  ]);
  assert.equal(split.existingGroups.length, 1);
  assert.equal(split.existingGroups[0].issueNumber, 2);
  assert.equal(split.existingGroups[0].tests.length, 1);
  assert.equal(split.newGroups.length, 1);
  assert.equal(split.newGroups[0].tests[0].fingerprint, mobile.fingerprint);
  assert.equal(split.newGroups[0].groupId, 'new-1');
  assert.equal(split.existingGroups[0].groupId, 'issue-2-1');
});

test('does not send a group that was already triaged for this run', () => {
  const payload = collectFromReport(
    {
      suites: [
        { title: file, file, specs: [spec('same', [failedTest('desktop-chrome', 'Error: same')])] },
      ],
    },
    context,
  );
  const fingerprint = payload.groups[0].tests[0].fingerprint;
  const split = splitGroups(payload, [
    {
      number: 2,
      title: 'open',
      body: `<!-- playwright-fingerprint: ${fingerprint} -->\n<!-- playwright-run: 99 -->`,
    },
  ]);
  assert.equal(split.existingGroups.length, 0);
  assert.equal(split.newGroups.length, 0);
  assert.equal(split.skippedSameRun.length, 1);
});

test('builds an issue plan from Cursor JSON and preserves the original first failure', () => {
  const group = {
    groupId: 'new-1',
    errorKey: 'Error: credentials were rejected',
    signal: 'Error: credentials were rejected',
    firstFailedAt: '2026-11-01 22:34:00 SGT',
    lastFailedAt: '2026-11-01 22:34:00 SGT',
    testCount: 1,
    tests: [
      {
        fingerprint: 'desktop-chrome::src/tests/login/wrong-password.spec.ts::cannot sign in',
        name: 'cannot sign in',
        specPath: file,
        projectName: 'desktop-chrome',
        specUrl: 'https://github.com/acme/shop/blob/abc123/file#L4',
        lastFailedAt: '2026-11-01 22:34:00 SGT',
      },
    ],
  };
  const existing = {
    ...group,
    groupId: 'issue-4-1',
    issueNumber: 4,
    lastFailedAt: '2026-11-01 23:00:00 SGT',
  };
  const plan = planApply({
    structured: {
      create: [
        {
          groupId: 'new-1',
          title: 'Login > wrong password is rejected',
          hypothesis: 'application_bug (high)',
          body: 'Summary\n\n<!-- playwright-fingerprint: fake -->',
        },
      ],
      update: [{ groupId: 'issue-4-1', issueNumber: 4, comment: 'It failed again.' }],
      skip: [],
    },
    newGroups: [group],
    existingGroups: [existing],
    runId: '99',
    label: 'playwright-failure',
    assignees: ['ianahilario'],
    bodies: new Map([
      [
        4,
        [
          'First failed: 2026-10-01 10:00:00 SGT',
          'Last failed: 2026-10-02 10:00:00 SGT',
          '<!-- playwright-fingerprint: desktop-chrome::src/tests/login/wrong-password.spec.ts::cannot sign in -->',
          '<!-- playwright-run: 1 -->',
        ].join('\n'),
      ],
    ]),
  });

  assert.equal(plan.creates[0].title, 'Login > wrong password is rejected');
  assert.ok(plan.creates[0].labels.includes('hypothesis:application_bug'));
  assert.ok(plan.creates[0].labels.includes('project:desktop-chrome'));
  assert.match(plan.creates[0].body, /First failed: 2026-11-01 22:34:00 SGT/);
  assert.match(
    plan.creates[0].body,
    /desktop-chrome::src\/tests\/login\/wrong-password\.spec\.ts::cannot sign in/,
  );
  assert.doesNotMatch(plan.creates[0].body, /fake/);
  assert.match(plan.updates[0].body, /First failed: 2026-10-01 10:00:00 SGT/);
  assert.match(plan.updates[0].body, /Last failed: 2026-11-01 23:00:00 SGT/);
  assert.match(plan.updates[0].body, /<!-- playwright-run: 99 -->/);
  assert.match(plan.updates[0].comment, /\*\*Seen again\*\* on 2026-11-01 23:00:00 SGT/);
  assert.deepEqual(plan.creates[0].assignees, ['ianahilario']);
});

test('rejects a skipped group that has a real error', () => {
  assert.throws(
    () =>
      planApply({
        structured: {
          create: [],
          update: [],
          skip: [{ groupId: 'new-1', reason: 'looks flaky' }],
        },
        newGroups: [
          {
            groupId: 'new-1',
            errorKey: 'Error: no',
            firstFailedAt: '2026-11-01 22:34:00 SGT',
            lastFailedAt: '2026-11-01 22:34:00 SGT',
            tests: [{ fingerprint: 'desktop-chrome::file::name', projectName: 'desktop-chrome' }],
          },
        ],
        existingGroups: [],
        runId: '99',
        label: 'playwright-failure',
        assignees: [],
        bodies: new Map(),
      }),
    /only allowed when the error is unknown/,
  );
});

test('reads Cursor JSON from the agent envelope', () => {
  const parsed = parseCursorOutput(
    JSON.stringify({
      subtype: 'success',
      is_error: false,
      result: '```json\n{"create":[],"update":[],"skip":[]}\n```',
    }),
  );
  assert.deepEqual(parsed, { create: [], update: [], skip: [] });
  assert.throws(
    () => parseCursorOutput(JSON.stringify({ subtype: 'error', is_error: true, result: '' })),
    /did not finish/,
  );
});

test('parses more than one GitHub page of issues', () => {
  const text = '[\n  {"number": 1}\n]\n[\n  {"number": 2}\n]\n';
  assert.deepEqual(
    parseGhList(text).map((issue) => issue.number),
    [1, 2],
  );
});

test('closes an issue only when every listed test passed', () => {
  const passed = 'desktop-chrome::src/a.spec.ts::passes';
  const flaky = 'desktop-chrome::src/a.spec.ts::flaky';
  const missing = 'desktop-chrome::src/a.spec.ts::missing';
  const payload = {
    failedFingerprints: [],
    launchResults: [
      { fingerprint: passed, status: 'passed' },
      { fingerprint: flaky, status: 'flaky' },
    ],
    launch: { id: '99', name: 'Nightly', url: 'https://github.com/acme/shop/actions/runs/99' },
  };
  const closed = decideClosures(payload, [
    { number: 1, title: 'done', body: `<!-- playwright-fingerprint: ${passed} -->` },
  ]);
  assert.equal(closed.toClose.length, 1);
  const kept = decideClosures(payload, [
    {
      number: 2,
      title: 'retry',
      body: `<!-- playwright-fingerprint: ${passed} -->\n<!-- playwright-fingerprint: ${flaky} -->`,
    },
    { number: 3, title: 'absent', body: `<!-- playwright-fingerprint: ${missing} -->` },
    { number: 4, title: 'blank', body: 'no marker' },
  ]);
  assert.deepEqual(
    kept.kept.map((item) => item.reason),
    ['not passed', 'not in run', 'no fingerprints'],
  );
  assert.match(closeComment(payload.launch), /passed without a retry/);
  assert.match(closeComment(payload.launch), /<!-- playwright-run: 99 -->/);
});

test('inserts the latest failure without changing the first one', () => {
  const body = updateIssueBody('First failed: 2026-10-01 10:00:00 SGT\n\nDetails\n', {
    lastFailedAt: '2026-11-01 22:34:00 SGT',
    runId: '99',
  });
  assert.match(body, /First failed: 2026-10-01 10:00:00 SGT\nLast failed: 2026-11-01 22:34:00 SGT/);
  assert.match(body, /<!-- playwright-run: 99 -->/);
});

test('tells Cursor to return JSON and not call gh', () => {
  const prompt = buildPrompt('playwright-failure-issues');
  assert.match(prompt, /playwright-failure-issues\/new-groups\.json/);
  assert.match(prompt, /Do not call gh/);
});
