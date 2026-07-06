// src/pages/PrivacyPolicy.tsx
import React from "react";
import LegalPage from "../components/Legal/LegalPage";
import { privacyPolicyContent } from "../Data/legalContent";
import AppLayout from "../components/Layout/AppLayout";

const PrivacyPolicy: React.FC = () => (
  <AppLayout currentPage="Privacy Policy" hideSidebar={false}>
    <LegalPage 
      title="Privacy Policy" 
      effectiveDate="July 6, 2026" 
      blocks={privacyPolicyContent} 
    />
  </AppLayout>
);

export default PrivacyPolicy;