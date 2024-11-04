import { cn } from '@/lib/utils';
import { useHover } from '@uidotdev/usehooks';

interface Props {
  isActive: boolean;
}

export function HomeIcon({ isActive }: Props) {
  const [ref, isHovering] = useHover();

  // const images = ['package_opened_small.png', 'package_small.png'].map(
  //   (src) => {
  //     console.log('Image created');
  //     return <img className="h-9 w-9" src={src} />;
  //   },
  // );

  // const icon = isHovering ? images[0] : images[1];

  return (
    <div ref={ref} className="flex items-center gap-1.5">
      <div className="grid">
        <img
          className={cn(
            'invisible col-start-1 row-start-1 h-9 w-9',
            isHovering && 'visible',
          )}
          src="package_opened_small.png"
        />
        <img
          className={cn(
            'visible col-start-1 row-start-1 h-9 w-9',
            isHovering && 'invisible',
          )}
          src="package_small.png"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <p
          className={cn(
            'text-center font-semibold leading-none text-foreground/60 transition-colors',
            isHovering && 'text-foreground/80',
            isActive && 'text-foreground',
          )}
        >
          Black box
        </p>
        <p
          className={cn(
            'text-center font-semibold leading-none text-foreground/60 transition-colors',
            isHovering && 'text-foreground/80',
            isActive && 'text-foreground',
          )}
        >
          opener
        </p>
      </div>
    </div>
  );
}
