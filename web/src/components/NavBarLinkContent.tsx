import { cn } from '@/lib/utils';

interface Props {
  isActive: boolean;
  title: string;
}

export function NavBarLinkContent(props: Props) {
  return (
    <div
      className={cn(
        'text-foreground/60 hover:text-foreground/80 transition-colors',
        props.isActive && 'text-foreground hover:text-foreground',
      )}
    >
      {props.title}
    </div>
  );
}
