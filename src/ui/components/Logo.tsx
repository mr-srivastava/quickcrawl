/** Wordmark: page curl into markdown hash */
export function Logo({ class: className = 'h-9 w-9 text-accent' }: { class?: string }) {
  return (
    <svg
      class={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="3"
        width="18"
        height="24"
        rx="2"
        fill="currentColor"
        fill-opacity="0.12"
        stroke="currentColor"
        stroke-opacity="0.35"
        stroke-width="1.5"
      />
      <path
        d="M22 3v6h6"
        stroke="currentColor"
        stroke-opacity="0.4"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M10 14h10M10 18h8M10 22h6"
        stroke="currentColor"
        stroke-opacity="0.35"
        stroke-width="1.25"
        stroke-linecap="round"
      />
      <circle cx="24" cy="24" r="6" fill="currentColor" />
      <path
        d="M22.5 24h3M24 22.5v3"
        stroke="#fffef8"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}
