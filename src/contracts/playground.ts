import * as v from 'valibot';

const webUrl = v.pipe(
  v.string(),
  v.check((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'URL must use HTTP or HTTPS'),
);

export const PlaygroundInitSchema = v.object({
  endpoint: v.pipe(v.string(), v.startsWith('/')),
  exampleUrls: v.pipe(v.array(webUrl), v.minLength(1)),
});

export type PlaygroundInit = v.InferOutput<typeof PlaygroundInitSchema>;

export function serializePlaygroundInit(init: PlaygroundInit): string {
  return JSON.stringify(init);
}

export function parsePlaygroundInit(
  value: string | undefined,
): PlaygroundInit | undefined {
  try {
    const parsed = v.safeParse(PlaygroundInitSchema, JSON.parse(value ?? 'null'));
    return parsed.success ? parsed.output : undefined;
  } catch {
    return undefined;
  }
}
