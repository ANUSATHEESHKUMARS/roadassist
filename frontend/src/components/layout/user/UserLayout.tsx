// import React from "react";
// import { Outlet } from "react-router-dom";
// import { Sidebar } from "./Sidebar";
// import { Header } from "./Header";

// export const UserLayout: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-background text-foreground flex">

//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Area */}
//       <div className="flex-1 min-w-0 flex flex-col">

//         {/* Header */}
//         <Header />

//         {/* Page Content */}
//         <main className="flex-1 p-4 sm:p-6 lg:p-8">
//           <Outlet />
//         </main>

//       </div>

//     </div>
//   );
// };

import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const UserLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Landing page should not display dashboard layout
  const isLandingPage = pathname === "/";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isLandingPage ? (
        // Landing Page
        <main className="min-h-screen">
          <Outlet />
        </main>
      ) : (
        // User Dashboard Layout
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header />

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
        </div>
      )}
    </div>
  );
};
