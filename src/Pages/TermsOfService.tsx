// src/pages/TermsOfService.tsx
import React from "react";
import LegalPage from "../components/Legal/LegalPage";
import { termsOfServiceContent } from "../Data/legalContent";
import AppLayout from "../components/Layout/AppLayout";

const TermsOfService: React.FC = () => (
  <AppLayout currentPage="Terms of Service" hideSidebar={false}>
    <LegalPage
      title="Terms of Service"
      effectiveDate="July 6, 2026"
      blocks={termsOfServiceContent}
    />
  </AppLayout>
);

export default TermsOfService;
