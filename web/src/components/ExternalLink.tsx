interface Props {
  href: string;
  imgSrc: string;
}

export function ExternalLink({ href, imgSrc }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:bg-muted rounded-md p-2 transition-colors"
    >
      <img className="h-9" src={imgSrc} />
    </a>
  );
}
