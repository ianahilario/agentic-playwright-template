export const testTag = {
  desktop: '@desktop',
  mobile: '@mobile',
  smoke: '@smoke',
} as const;

export type ViewportTag = typeof testTag.desktop | typeof testTag.mobile;

export type SuiteTag = typeof testTag.smoke;

export type TestTag = ViewportTag | SuiteTag;

export function setTestTags(tag: ViewportTag, ...moreTags: TestTag[]): { tag: TestTag[] } {
  return { tag: [tag, ...moreTags] };
}
