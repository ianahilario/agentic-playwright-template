export const pageUrl = {
  ssoHome: 'https://sso.sleekflow.io/',
  appInbox: /app\.sleekflow\.io\/.+\/inbox/,
  signupIdentifier: /sso\.sleekflow\.io\/u\/signup/,
  verifyEmail: /app\.sleekflow\.io\/.+error=access_denied/,
  termsOfService: /sleekflow\.io\/archive-terms/,
  privacyPolicy: /sleekflow\.io\/privacy/,
} as const;

export const endpoint = {
  ssoLoginPassword: '/u/login/password',
  ssoSignupIdentifier: '/u/signup/identifier',
  ssoSignupPassword: '/u/signup/password',
  sendPasswordlessLoginEmail: '/auth0/account/SendPasswordlessLoginEmail',
} as const;
