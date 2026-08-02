import * as v from 'valibot';
import type { CrawlError, Result } from '../workflows/crawl/types';

const httpOrHttpsUrl = v.pipe(
  v.string(),
  v.url(),
  v.check(
    (url) => ['http:', 'https:'].includes(new URL(url).protocol),
    'URL must use HTTP or HTTPS',
  ),
);

/** Public crawl request body for `POST /crawl`. */
export const CrawlRequestSchema = v.object({
  url: httpOrHttpsUrl,
});

export type CrawlRequest = v.InferOutput<typeof CrawlRequestSchema>;

export const CrawlResultDataSchema = v.object({
  markdown: v.string(),
  title: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.string())),
});

export type CrawlResultData = v.InferOutput<typeof CrawlResultDataSchema>;

const ApiErrorEnvelopeSchema = v.object({
  success: v.literal(false),
  error: v.object({
    type: v.string(),
    message: v.string(),
    details: v.optional(v.unknown()),
  }),
});

const CrawlSuccessEnvelopeSchema = v.object({
  success: v.literal(true),
  data: CrawlResultDataSchema,
});

export const CrawlApiResponseSchema = v.variant('success', [
  CrawlSuccessEnvelopeSchema,
  ApiErrorEnvelopeSchema,
]);

export type CrawlSuccess = v.InferOutput<typeof CrawlSuccessEnvelopeSchema>;
export type CrawlApiResponse = v.InferOutput<typeof CrawlApiResponseSchema>;

export type CrawlResult = Result<CrawlResultData, CrawlError>;

export function parseCrawlApiResponse(
  value: unknown,
): CrawlApiResponse | undefined {
  const parsed = v.safeParse(CrawlApiResponseSchema, value);
  return parsed.success ? parsed.output : undefined;
}

export function toCrawlResultData(input: {
  markdown: string;
  title?: string;
  metadata?: Record<string, string | undefined>;
}): CrawlResultData {
  const metadata = input.metadata
    ? (Object.fromEntries(
        Object.entries(input.metadata).filter(
          (entry): entry is [string, string] => entry[1] !== undefined,
        ),
      ) as Record<string, string>)
    : undefined;

  return {
    markdown: input.markdown,
    ...(input.title !== undefined && { title: input.title }),
    ...(metadata !== undefined &&
      Object.keys(metadata).length > 0 && { metadata }),
  };
}
