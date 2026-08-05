// src/pages/TermsOfService.tsx
import React from "react";
import PageHelmet from "../components/SEO/PageHelmet";
import LegalPage from "../components/Legal/LegalPage";
import { termsOfServiceContent } from "../Data/legalContent";
import AppLayout from "../components/Layout/AppLayout";

const TermsOfService: React.FC = () => (
  <AppLayout currentPage="Terms of Service" hideSidebar={false}>
    <PageHelmet
      title="Terms of Service | SCHOOLDRA"
      description="Read the SCHOOLDRA terms of service governing use of our JAMB UTME prep platform and features."
      canonical="https://www.schooldra.com/terms-of-service"
    />
    <LegalPage
      title="Terms of Service"
      effectiveDate="July 6, 2026"
      blocks={termsOfServiceContent}
    />
  </AppLayout>
);

export default TermsOfService;
