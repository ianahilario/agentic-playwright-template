import { faker } from '@faker-js/faker';

import { requiredEnv } from '@/helpers/env';

export function defaultUser(): { email: string; password: string } {
  return {
    email: requiredEnv('USER_DEFAULT_EMAIL'),
    password: requiredEnv('USER_DEFAULT_PASSWORD'),
  };
}

export function unknownUser(): { email: string; password: string } {
  return {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
  };
}

export function blockedDomainUser(): { email: string; password: string } {
  return {
    email: 'lasitac680@mediseat.com',
    password: requiredEnv('USER_SIGNUP_PASSWORD'),
  };
}

export function newUser(): { email: string; password: string } {
  const signUpEmail = requiredEnv('USER_SIGNUP_EMAIL');
  if (!signUpEmail.includes('[replace]')) {
    throw new Error('USER_SIGNUP_EMAIL must contain [replace]');
  }

  const uniquePart = `${Date.now()}${process.env.TEST_WORKER_INDEX ?? '0'}`;
  return {
    email: requiredEnv('USER_SIGNUP_EMAIL').replace('[replace]', uniquePart),
    password: requiredEnv('USER_SIGNUP_PASSWORD'),
  };
}
