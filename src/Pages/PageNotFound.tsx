import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import Button from "../components/ui/Button";
import { useState } from "react";

const NotFound = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AppLayout
      currentPage="not found"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        {/* Icon / Illustration */}
        <div className="bg-brand/10 border-brand/20 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border text-4xl">
          🚫
        </div>

        {/* Title */}
        <h1 className="font-display mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
          404
        </h1>

        {/* Subtitle */}
        <p className="text-textMuted mb-6 max-w-md">
          Oops… the page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" onClick={() => navigate("/")}>
            Go Home
          </Button>

          <Button variant="ghost" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
