import { Link } from '@tanstack/react-router';
import { HomeIcon } from './HomeIcon';

export function NavBar() {
    return (
        <header className="sticky top-0 z-50 w-full border-border/40 bg-gray-300-500/95 backdrop-blur supports-[backdrop-filter]:bg-gray-300/60">
            <div className="container flex h-14 max-w-screen-2xl items-center w-full relative">
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <Link to="/demo" className="flex items-center">
                        {({ isActive }) => <HomeIcon isActive={isActive} />}
                    </Link>
                </div>

                <div className="absolute right-[-70px] top-1.5 flex items-center gap-4">
                    <a href="https://www.tu-darmstadt.de" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <img src="/tuda_logo.svg" alt="TU Darmstadt" className="h-11 object-contain"/>
                    </a>
                    <a href="https://www.informatik.tu-darmstadt.de/systems/systems_tuda/index.en.jsp"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center">
                        <img src="/dm_logo.svg" alt="DM Logo" className="h-11 object-contain"/> {/* Scaled to height */}
                    </a>
                    <a href="https://github.com/DataManagementLab/thesis-XAI-learnedcostmodels" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <img src="/github-mark.svg" alt="GitHub Logo" className="h-11 object-contain"/> {/* New GitHub logo */}
                    </a>
                </div>
            </div>
        </header>
    );
}