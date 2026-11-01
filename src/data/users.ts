export const standardUser = {
  username: 'standard_user',
  password: process.env.USER_PASSWORD!,
} as const;

export const lockedOutUser = {
  username: 'locked_out_user',
  password: process.env.USER_PASSWORD!,
} as const;
