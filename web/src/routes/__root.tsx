import { NavBar } from '@/components/NavBar';
import { createRootRoute, Outlet } from '@tanstack/react-router';

// import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col">
      <NavBar></NavBar>
      <div className="px-4 pt-2 pb-4">
        <Outlet />
      </div>
      {/* <TanStackRouterDevtools /> */}
    </div>
  ),
});
