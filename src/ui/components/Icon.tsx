import type { IconNode } from 'lucide';
import { cn } from '../cn';

type IconProps = {
  icon: IconNode;
  class?: string;
  size?: number;
  strokeWidth?: number;
  title?: string;
};

type SvgAttrs = Record<string, string | number | undefined>;

function IconShape({
  tag,
  attrs,
  index,
}: {
  tag: string;
  attrs: SvgAttrs;
  index: number;
}) {
  const key = `${tag}-${index}`;

  switch (tag) {
    case 'path':
      return <path key={key} {...attrs} />;
    case 'circle':
      return <circle key={key} {...attrs} />;
    case 'rect':
      return <rect key={key} {...attrs} />;
    case 'line':
      return <line key={key} {...attrs} />;
    case 'polyline':
      return <polyline key={key} {...attrs} />;
    case 'polygon':
      return <polygon key={key} {...attrs} />;
    case 'ellipse':
      return <ellipse key={key} {...attrs} />;
    case 'g':
      return <g key={key} {...attrs} />;
    default:
      return null;
  }
}

/** Renders a Lucide icon as inline SVG for Hono JSX (SSR-safe). */
export function Icon({
  icon,
  class: className,
  size = 24,
  strokeWidth = 2,
  title,
}: IconProps) {
  return (
    <svg
      class={cn('shrink-0', className)}
      {...(size > 0 ? { width: size, height: size } : {})}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      role={title ? 'img' : undefined}
    >
      {icon.map((entry, index) => {
        const [tag, attrs] = entry;
        return (
          <IconShape
            key={`${tag}-${index}`}
            tag={tag}
            attrs={attrs}
            index={index}
          />
        );
      })}
    </svg>
  );
}
