import { NavBar } from '@/components/NavBar';
import { createRootRoute, Outlet } from '@tanstack/react-router';

// import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col px-8 pb-[var(--main-bottom-padding)]">
      <NavBar></NavBar>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </div>
  ),
});
