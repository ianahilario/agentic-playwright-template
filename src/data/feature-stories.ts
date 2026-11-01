export const featureStories = {
  login: ['able to log in', 'unable to log in'],
} as const;

type FeatureName = keyof typeof featureStories;

type StoryFor<Feature extends FeatureName> = (typeof featureStories)[Feature][number];

export type FeatureStory = {
  [Feature in FeatureName]: { feature: Feature; story: StoryFor<Feature> };
}[FeatureName];
