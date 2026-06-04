import React, { useState } from "react";
import AppLayout from "../components/Layout/AppLayout";
import ExamPaywall from "../components/MockExam/ExamPaywall";
import { useNavigate } from "react-router-dom";
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
      <div className="max-w-4xl mx-auto py-6">
        {isPro ? (
          <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-8 text-center shadow-xl">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/20">
              <Crown className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4 text-textMain">
              You're a Pro Member!
            </h1>
            <p className="text-textDim mb-8 max-w-md mx-auto leading-relaxed">
              Thank you for supporting JAMBIFY. You have full access to all premium features, including AI Tutor, detailed mock reviews, and offline study mode.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-10">
              {[
                "Unlimited AI Tutor Questions",
                "Full Mock Exam Explanations",
                "Offline Mode for All Subjects",
                "Advanced Performance Analytics",
                "Priority Support Access",
                "Ad-Free Learning Experience"
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 bg-bgSurface border border-borderMuted p-4 rounded-2xl">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span className="text-sm font-medium text-textMain">{benefit}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/")}
              className="bg-brand text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-brand/20 hover:bg-brand-light transition-all active:scale-95"
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
              onBack={() => navigate("/")} 
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProPage;
