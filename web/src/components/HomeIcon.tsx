import { cn } from '@/lib/utils';
import { useHover } from '@uidotdev/usehooks';

interface Props {
  isActive: boolean;
}

export function HomeIcon({ isActive }: Props) {
  const [ref, isHovering] = useHover();

  return (
    <div
      ref={ref}
      className="flex items-center gap-1.5 text-lg leading-none font-bold"
    >
      <div className="grid">
        <img
          className={cn(
            'invisible col-start-1 row-start-1 size-12',
            isHovering && 'visible',
          )}
          src="package_opened_small.png"
        />
        <img
          className={cn(
            'visible col-start-1 row-start-1 size-12',
            isHovering && 'invisible',
          )}
          src="package_small.png"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <p
          className={cn(
            'text-foreground/60 text-center leading-none font-semibold transition-colors',
            isHovering && 'text-foreground/80',
            isActive && 'text-foreground',
          )}
        >
          Black Box
        </p>
        <p
          className={cn(
            'text-foreground/60 text-center leading-none font-semibold transition-colors',
            isHovering && 'text-foreground/80',
            isActive && 'text-foreground',
          )}
        >
          Opener
        </p>
      </div>
    </div>
  );
}
