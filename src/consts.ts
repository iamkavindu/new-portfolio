export const SITE_TITLE = 'Kavindu Perera';
export const SITE_DESCRIPTION =
  'Backend software engineer specializing in Java, Spring Boot, and scalable microservices. Building reliable systems at Wiley.';
export const SITE_URL = 'https://iamkavindu.dev';

/** Default Open Graph / Twitter share image (1200×630). Prefer PNG for maximum platform support. */
export const DEFAULT_OG_IMAGE = '/og-default.svg';

export const SOCIAL = {
  github: 'https://github.com/iamkavindu',
  linkedin: 'https://www.linkedin.com/in/iamkavindu',
  medium: 'https://medium.com/@iamkavindu',
} as const;

export const AUTHOR = {
  name: 'Kavindu Perera',
  jobTitle: 'Software Engineer',
  worksFor: 'Wiley Global Technology',
  /** Set when ready to show a public mailto on /contact/ */
  email: '' as string,
} as const;

/** Signature strengths for About — keep short and memorable */
export const STRENGTHS = [
  {
    title: 'Backend systems',
    detail: 'APIs, service boundaries, and data flows that stay clear under change.',
  },
  {
    title: 'Java & Spring',
    detail: 'Production Spring Boot services, messaging, and integration patterns.',
  },
  {
    title: 'Cloud-native pipelines',
    detail: 'Object storage, events, and workers — from upload to processed asset.',
  },
  {
    title: 'Cross-boundary types',
    detail: 'Keeping frontend and backend contracts aligned without manual drift.',
  },
] as const;
