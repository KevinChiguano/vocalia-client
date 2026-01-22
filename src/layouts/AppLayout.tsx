import { useNavigate, Outlet } from "react-router-dom";
import { Topbar } from "@/components/layout/Topbar";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export const AppLayout = () => {
  const navigate = useNavigate();

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
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              isIconOnly
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Breadcrumb className="mb-0" />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
