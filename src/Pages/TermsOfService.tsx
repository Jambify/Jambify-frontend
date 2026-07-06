// src/pages/TermsOfService.tsx
import React from "react";
import LegalPage from "../components/Legal/LegalPage";
import { termsOfServiceContent } from "../Data/legalContent";

const TermsOfService: React.FC = () => (
  <LegalPage title="Terms of Service" effectiveDate="[INSERT DATE]" blocks={termsOfServiceContent} />
);

export default TermsOfService;