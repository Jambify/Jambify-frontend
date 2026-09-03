import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import PageHelmet from "../components/SEO/PageHelmet";
import ExamPaywall from "../components/MockExam/ExamPaywall";

type RenewalLocationState = {
  fromProStatus?: boolean;
};

const RenewPro: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as RenewalLocationState | null;

  if (!state?.fromProStatus) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <PageHelmet
        title="Renew Schooldra Pro | SCHOOLDRA"
        description="Renew your Schooldra Pro access for continued AI explanations, offline question packs, performance analytics, and mock exam review."
        canonical="https://www.schooldra.com/pro"
      />
      <ExamPaywall
        onUpgrade={() => {
          // Reload the authenticated shell so ProStatusBanner fetches the renewed expiry.
          window.location.assign("/dashboard");
        }}
        onBack={() => navigate("/dashboard", { replace: true })}
      />
    </>
  );
};

export default RenewPro;
