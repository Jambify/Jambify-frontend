// src/pages/PrivacyPolicy.tsx
import React from "react";
import PageHelmet from "../components/SEO/PageHelmet";
import LegalPage from "../components/Legal/LegalPage";
import { privacyPolicyContent } from "../Data/legalContent";
import AppLayout from "../components/Layout/AppLayout";

const PrivacyPolicy: React.FC = () => (
  <AppLayout currentPage="Privacy Policy" hideSidebar={false}>
    <PageHelmet
      title="Privacy Policy | SCHOOLDRA"
      description="SCHOOLDRA's privacy policy describing how we handle user data for JAMB UTME preparation services."
      canonical="https://www.schooldra.com/privacy-policy"
    />
    <LegalPage
      title="Privacy Policy"
      effectiveDate="July 6, 2026"
      blocks={privacyPolicyContent}
    />
  </AppLayout>
);

export default PrivacyPolicy;
