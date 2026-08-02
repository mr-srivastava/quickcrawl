export const LOADING_STAGES = ['Fetch', 'Clean', 'Convert'] as const;

export type LoadingStage = (typeof LOADING_STAGES)[number];
