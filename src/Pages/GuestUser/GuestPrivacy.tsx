// src/pages/PrivacyPolicy.tsx
import React from "react";
import LegalPage from "../../components/Legal/LegalPage";
import { privacyPolicyContent } from "../../Data/legalContent";

const PrivacyPolicy: React.FC = () => (
    
  <LegalPage
    title="Privacy Policy"
    effectiveDate="July 6, 2026"
    blocks={privacyPolicyContent}
  />
);

export default PrivacyPolicy;
