import { cn } from '@/lib/utils';

interface Props {
  isActive: boolean;
  title: string;
}

export function NavBarLinkContent(props: Props) {
  return (
    <div
      className={cn(
        'transition-colors hover:text-foreground/80',
        props.isActive ? 'text-foreground' : 'text-foreground/60',
      )}
    >
      {props.title}
    </div>
  );
}
