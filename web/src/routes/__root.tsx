import { NavBar } from '@/components/NavBar';
import { createRootRoute, Outlet } from '@tanstack/react-router';

// import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col overflow-hidden px-8 pb-8 font-sans bg-gray-100 ">
      <NavBar></NavBar>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </div>
  ),
});
