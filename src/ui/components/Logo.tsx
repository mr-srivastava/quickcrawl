import { ScanSearch } from 'lucide';
import { Icon } from './Icon';

export function Logo({
  class: className = 'h-9 w-9 text-accent',
}: {
  class?: string;
}) {
  return (
    <span
      class="inline-flex shrink-0 items-center justify-center rounded-lg bg-accent/10 p-1.5"
      aria-hidden="true"
    >
      <Icon icon={ScanSearch} class={className} size={20} strokeWidth={2.25} />
    </span>
  );
}
