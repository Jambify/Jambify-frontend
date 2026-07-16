// src/pages/GuestTermsOfService.tsx
import React from "react";
import LegalPage from "../../components/Legal/LegalPage";
import { termsOfServiceContent } from "../../Data/legalContent";
import PageHelmet from "../../components/SEO/PageHelmet";

const GuestTermsOfService: React.FC = () => (
  <>
    <PageHelmet
      title="Terms of Service | SCHOOLDRA"
      description="SCHOOLDRA's terms of service for JAMB UTME exam preparation users."
      canonical="https://www.schooldra.com/guest/terms-of-service"
    />
    <LegalPage
      title="Terms of Service"
      effectiveDate="July 6, 2026"
      blocks={termsOfServiceContent}
    />
  </>
);

export default GuestTermsOfService;
