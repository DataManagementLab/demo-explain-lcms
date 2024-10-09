import { NavBar } from '@/components/NavBar';
import { createRootRoute, Outlet } from '@tanstack/react-router';

// import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col">
      <NavBar></NavBar>
      <div className="px-4 py-2">
        <Outlet />
      </div>
      {/* <TanStackRouterDevtools /> */}
    </div>
  ),
});
