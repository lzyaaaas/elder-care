import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { PublicFooter } from "../components/public/PublicFooter";
import { PublicHeader } from "../components/public/PublicHeader";

export function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main>
        <div key={pathname} className="animate-rise motion-reduce:animate-none">
          <Outlet />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
