import { Link } from '@tanstack/react-router';

import { NavBarLinkContent } from './NavBarLinkContent';

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
            Home
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link to="/demo">
              {({ isActive }) => (
                <NavBarLinkContent title="Demo" isActive={isActive} />
              )}
            </Link>
            <Link to="/editor">
              {({ isActive }) => (
                <NavBarLinkContent title="Editor" isActive={isActive} />
              )}
            </Link>
            <Link to="/evaluation">
              {({ isActive }) => (
                <NavBarLinkContent title="Evaluation" isActive={isActive} />
              )}
            </Link>
            <Link to="/evaluation-results">
              {({ isActive }) => (
                <NavBarLinkContent
                  title="Evaluation results"
                  isActive={isActive}
                />
              )}
            </Link>
            <Link to="/about">
              {({ isActive }) => (
                <NavBarLinkContent title="About" isActive={isActive} />
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
