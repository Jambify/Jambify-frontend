import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import Button from "../components/ui/Button";
import { useState } from "react";

const NotFound = () => {
  const navigate = useNavigate();
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AppLayout currentPage="not found"  isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
      <div className="flex flex-col items-center justify-center text-center py-20 px-4">

        {/* Icon / Illustration */}
        <div className="w-20 h-20 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-4xl mb-6">
          🚫
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          404
        </h1>

        {/* Subtitle */}
        <p className="text-textMuted max-w-md mb-6">
          Oops… the page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            variant="primary"
            onClick={() => navigate("/")}
          >
            Go Home
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>

      </div>
    </AppLayout>
  );
};

export default NotFound;