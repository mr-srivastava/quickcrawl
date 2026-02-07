/**
 * Deep readonly: makes all nested properties readonly (except functions).
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};

/** Exclude undefined from type */
export type NonUndefined<T> = T extends undefined ? never : T;

/**
 * Object type with undefined values removed from values.
 * Keys whose value is undefined are omitted.
 */
export type RemoveUndefined<T> = {
  [K in keyof T as T[K] extends undefined ? never : K]: NonUndefined<T[K]>;
};

/** Ensure specified keys K are required on T */
export type EnsureRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Extract keys that are required (not optional) on T */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/** Extract keys that are optional on T */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
