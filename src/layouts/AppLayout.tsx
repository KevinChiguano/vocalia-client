import { Outlet } from "react-router-dom";
import { Topbar } from "@/components/layout/Topbar";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-bg">
      <div className="flex flex-col min-h-screen">
        <Spinner />
        <ErrorModal />
        <Topbar />

        <main
          className={`
              flex-1 p-4 md:p-6 mt-16
              transition-all duration-300`}
        >
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
};
