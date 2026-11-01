import { fileURLToPath } from 'node:url';

import {
  type PlaywrightTestArgs,
  type PlaywrightTestOptions,
  type PlaywrightWorkerArgs,
  type PlaywrightWorkerOptions,
  type TestDetails,
  type TestInfo,
  type TestType,
} from '@playwright/test';

import { type FeatureStory } from '@/data/feature-stories';
import { testTag, type TestTag } from '@/data/test-tags';

export type Viewport = 'desktop' | 'mobile' | 'all';

export type TestOptions = {
  id: string;
  feature: FeatureStory;
  actor: string;
  expectedOutcome: string;
  scenario: string;
  isSmokeTest: boolean;
  viewport: Viewport;
};

type TestBody<Args> = (args: Args, testInfo: TestInfo) => Promise<void> | void;

type TestMembers<T> = {
  [K in keyof T]: T[K];
};

type RequiredTest<Args> = {
  (options: TestOptions, body: TestBody<Args>): void;
  only(options: TestOptions, body: TestBody<Args>): void;
};

type ExportedTest<
  TestArgs extends PlaywrightTestArgs & PlaywrightTestOptions,
  WorkerArgs extends PlaywrightWorkerArgs & PlaywrightWorkerOptions,
> = Omit<TestMembers<TestType<TestArgs, WorkerArgs>>, 'only'> & RequiredTest<TestArgs & WorkerArgs>;

function featureLabel(feature: FeatureStory['feature']): string {
  const [first, ...rest] = feature.split('-');
  return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(' ');
}

export function testTitle(options: TestOptions): string {
  return `[${options.id}] ${featureLabel(options.feature.feature)} > ${options.actor} > ${options.expectedOutcome}`;
}

export function testDetails(options: TestOptions): TestDetails {
  const tag: TestTag[] = [];

  if (options.viewport === 'desktop' || options.viewport === 'all') {
    tag.push(testTag.desktop);
  }

  if (options.viewport === 'mobile' || options.viewport === 'all') {
    tag.push(testTag.mobile);
  }

  if (options.isSmokeTest) {
    tag.push(testTag.smoke);
  }

  return {
    tag,
    annotation: [
      { type: 'feature', description: options.feature.feature },
      { type: 'story', description: options.feature.story },
      { type: 'scenario', description: options.scenario },
    ],
  };
}

type TestLocation = { file: string; line: number; column: number };

type TestRegistrar = {
  _createTest: (
    kind: 'default' | 'only',
    location: TestLocation,
    title: string,
    details: TestDetails,
    body: (...args: never[]) => unknown,
  ) => void;
};

function specLocation(): TestLocation {
  const previousPrepareStackTrace = Error.prepareStackTrace?.bind(Error);
  Error.prepareStackTrace = (_error, stackFrames) => {
    const frame = stackFrames[3];
    if (!frame) {
      throw new Error('test() could not find the spec that called it');
    }

    const fileName = frame.getFileName();
    const file = fileName?.startsWith('file://') ? fileURLToPath(fileName) : fileName;
    if (!file) {
      throw new Error('test() could not find the spec that called it');
    }

    return {
      file,
      line: frame.getLineNumber() ?? 0,
      column: frame.getColumnNumber() ?? 0,
    };
  };

  const previousStackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = 4;
  const holder: { stack?: TestLocation } = {};
  Error.captureStackTrace(holder);
  const location = holder.stack;
  Error.stackTraceLimit = previousStackTraceLimit;
  Error.prepareStackTrace = previousPrepareStackTrace;

  if (!location || typeof location === 'string') {
    throw new Error('test() could not find the spec that called it');
  }

  return location;
}

function testRegistrar(baseTest: object): TestRegistrar {
  const symbol = Object.getOwnPropertySymbols(baseTest).find(
    (item) => item.description === 'testType',
  );
  const registrar: unknown = symbol ? Reflect.get(baseTest, symbol) : undefined;
  if (
    typeof registrar !== 'object' ||
    registrar === null ||
    !('_createTest' in registrar) ||
    typeof registrar._createTest !== 'function'
  ) {
    throw new Error('Could not read the Playwright test registrar');
  }

  return registrar as TestRegistrar;
}

export function test<
  TestArgs extends PlaywrightTestArgs & PlaywrightTestOptions,
  WorkerArgs extends PlaywrightWorkerArgs & PlaywrightWorkerOptions,
>(baseTest: TestType<TestArgs, WorkerArgs>): ExportedTest<TestArgs, WorkerArgs> {
  type Body = TestBody<TestArgs & WorkerArgs>;
  const registrar = testRegistrar(baseTest);

  function open(kind: 'default' | 'only', options: TestOptions, body: Body): void {
    registrar._createTest(kind, specLocation(), testTitle(options), testDetails(options), body);
  }

  function register(options: TestOptions, body: Body): void {
    open('default', options, body);
  }

  const wrapped = Object.assign(register, baseTest) as unknown as ExportedTest<
    TestArgs,
    WorkerArgs
  >;

  wrapped.only = (options: TestOptions, body: Body): void => {
    open('only', options, body);
  };

  return wrapped;
}
