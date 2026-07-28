import React, { useState } from "react";
import AppLayout from "../components/Layout/AppLayout";
import ExamPaywall from "../components/MockExam/ExamPaywall";
import { useNavigate } from "react-router";
import { useUserStore } from "../Store/useUserStore";
import { Crown, CheckCircle } from "lucide-react";

const ProPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isPro } = useUserStore();

  return (
    <AppLayout
      currentPage="pro"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="mx-auto max-w-4xl py-6">
        {isPro ? (
          <div className="bg-bgCard border-borderMuted rounded-brand-xl border p-8 text-center shadow-xl">
            <div className="bg-success/10 border-success/20 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border">
              <Crown className="text-success h-10 w-10" />
            </div>
            <h1 className="font-display text-textMain mb-4 text-3xl font-bold">
              You're a Pro Member!
            </h1>
            <p className="text-textDim mx-auto mb-8 max-w-md leading-relaxed">
              Thank you for supporting Schooldra. You have full access to all
              premium features, including AI Tutor, detailed mock reviews, and
              offline study mode.
            </p>

            <div className="mx-auto mb-10 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
              {[
                "Unlimited AI Tutor Questions",
                "Full Mock Exam Explanations",
                "Offline Mode for All Subjects",
                "Advanced Performance Analytics",
                "Priority Support Access",
                "Ad-Free Learning Experience",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="bg-bgSurface border-borderMuted flex items-center gap-3 rounded-2xl border p-4"
                >
                  <CheckCircle className="text-success h-5 w-5 shrink-0" />
                  <span className="text-textMain text-sm font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="bg-brand shadow-brand/20 hover:bg-brand-light rounded-full px-8 py-3 font-bold text-white shadow-lg transition-all active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ExamPaywall
              onUpgrade={() => {
                // The ExamPaywall already handles the upgrade logic
                // and syncs with the user store.
                window.location.reload();
              }}
              onBack={() => navigate("/dashboard")}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProPage;
