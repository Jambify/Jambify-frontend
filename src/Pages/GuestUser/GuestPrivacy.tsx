// src/pages/PrivacyPolicy.tsx
import React from "react";
import LegalPage from "../../components/Legal/LegalPage";
import { privacyPolicyContent } from "../../Data/legalContent";
import PageHelmet from "../../components/SEO/PageHelmet";

const PrivacyPolicy: React.FC = () => (
  <>
    <PageHelmet
      title="Privacy Policy | SCHOOLDRA"
      description="SCHOOLDRA's privacy policy for JAMB UTME exam preparation users."
      canonical="https://www.schooldra.com/guest/privacy-policy"
    />
    <LegalPage
      title="Privacy Policy"
      effectiveDate="July 6, 2026"
      blocks={privacyPolicyContent}
    />
  </>
);

export default PrivacyPolicy;
