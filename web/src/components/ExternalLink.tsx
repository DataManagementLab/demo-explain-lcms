interface Props {
  href: string;
  imgSrc: string;
}

export function ExternalLink({ href, imgSrc }: Props) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <img className="h-8" src={imgSrc} />
    </a>
  );
}
