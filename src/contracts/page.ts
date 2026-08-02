import * as v from 'valibot';
import { PlaygroundInitSchema } from './playground';

export const APP_MOUNT_ID = 'app-root';

const rateLimitSchema = v.object({
  maxRequests: v.number(),
  windowMs: v.number(),
});

export const HomePageInitSchema = v.object({
  page: v.literal('home'),
  title: v.string(),
  appName: v.string(),
  tagline: v.string(),
  exampleUrls: v.pipe(v.array(v.string()), v.minLength(1)),
  rateLimit: rateLimitSchema,
});

export const PlaygroundPageInitSchema = v.object({
  page: v.literal('playground'),
  title: v.string(),
  appName: v.string(),
  playground: PlaygroundInitSchema,
  baseUrl: v.string(),
});

export const DocsPageInitSchema = v.object({
  page: v.literal('docs'),
  title: v.string(),
  appName: v.string(),
  appVersion: v.string(),
  baseUrl: v.string(),
  rateLimit: rateLimitSchema,
  trustProxy: v.boolean(),
  cacheTtlMs: v.number(),
  cacheMaxSize: v.number(),
  healthExample: v.string(),
});

export const PageInitSchema = v.union([
  HomePageInitSchema,
  PlaygroundPageInitSchema,
  DocsPageInitSchema,
]);

export type HomePageInit = v.InferOutput<typeof HomePageInitSchema>;
export type PlaygroundPageInit = v.InferOutput<typeof PlaygroundPageInitSchema>;
export type DocsPageInit = v.InferOutput<typeof DocsPageInitSchema>;
export type PageInit = v.InferOutput<typeof PageInitSchema>;

export function serializePageInit(init: PageInit): string {
  return JSON.stringify(init);
}

export function parsePageInit(value: string | undefined): PageInit | undefined {
  try {
    const parsed = v.safeParse(PageInitSchema, JSON.parse(value ?? 'null'));
    return parsed.success ? parsed.output : undefined;
  } catch {
    return undefined;
  }
}
