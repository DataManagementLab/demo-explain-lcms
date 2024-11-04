import { cn } from '@/lib/utils';

interface Props {
  isActive: boolean;
  title: string;
}

export function NavBarLinkContent(props: Props) {
  return (
    <div
      className={cn(
        'text-foreground/60 transition-colors hover:text-foreground/80',
        props.isActive && 'text-foreground hover:text-foreground',
      )}
    >
      {props.title}
    </div>
  );
}
