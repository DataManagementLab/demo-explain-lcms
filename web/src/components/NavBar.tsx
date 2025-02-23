import { Link } from '@tanstack/react-router';

import { ExternalLink } from './ExternalLink';
import { HomeIcon } from './HomeIcon';

export function NavBar() {
  return (
    <header className="flex min-h-24 items-center">
      <Link to="/demo">
        {({ isActive }) => <HomeIcon isActive={isActive} />}
      </Link>
      <nav className="flex grow justify-center"></nav>
      <div className="flex gap-4">
        <ExternalLink
          href="https://www.tu-darmstadt.de"
          imgSrc="tuda_logo.svg"
        ></ExternalLink>
        <ExternalLink
          href="https://www.informatik.tu-darmstadt.de/systems/systems_tuda"
          imgSrc="dm_logo.svg"
        ></ExternalLink>
        <ExternalLink
          href="https://github.com/DataManagementLab/thesis-XAI-learnedcostmodels"
          imgSrc="github_logo.svg"
        ></ExternalLink>
      </div>
    </header>
  );
}
