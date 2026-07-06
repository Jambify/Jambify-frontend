// src/data/legalContent.ts

export type LegalBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "bullet"; text: string }
  | { type: "note"; text: string };

export const privacyPolicyContent: LegalBlock[] = [
  { type: "p", text: "JAMBIFY (\u201cJAMBIFY,\u201d \u201cwe,\u201d \u201cus,\u201d or \u201cour\u201d) provides a Progressive Web App designed to help students in Nigeria prepare for the Unified Tertiary Matriculation Examination (UTME/JAMB). This Privacy Policy explains what personal data we collect, why we collect it, how we use and protect it, and the rights you have over it. It applies to all users of JAMBIFY, including free and paid (subscription) users." },
  { type: "note", text: "Bracketed placeholders like [INSERT DATE] must be filled in before publishing, and we recommend a quick legal review before launch given that some JAMBIFY users are minors." },

  { type: "h1", text: "1. Who We Are" },
  { type: "p", text: "JAMBIFY is operated by [INSERT LEGAL/BUSINESS NAME], based in Nigeria. For any questions about this Policy or your data, you can reach us at:" },
  { type: "bullet", text: "Email: support@jambify.com" },
  { type: "bullet", text: "WhatsApp: [INSERT WHATSAPP SUPPORT LINE]" },

  { type: "h1", text: "2. Information We Collect" },
  { type: "h2", text: "2.1 Account Information" },
  { type: "p", text: "When you sign up, we collect your name, email address, and no password was required. We use Supabase as our backend authentication and database provider." },

  { type: "h2", text: "2.2 Academic and Performance Data" },
  { type: "p", text: "To power your dashboard and personalize your practice, we collect and store:" },
  { type: "bullet", text: "Your selected subject combination and topics" },
  { type: "bullet", text: "Quiz and mock exam attempts, answers, scores, and timing data" },
  { type: "bullet", text: "Progress statistics, streaks, and performance history" },

  { type: "h2", text: "2.3 Study Group and Chat Data" },
  { type: "p", text: "If you join or create a study group, we collect and store the messages you send within that group so they can be delivered to other members in real time. Group chat messages are visible to other members of the same group and are retained as part of the group's history." },

  { type: "h2", text: "2.4 Payment Information" },
  { type: "p", text: "If you subscribe to a paid plan, payment is handled by a third-party payment processor, Flutterwave. JAMBIFY does not directly collect or store your full card number, CVV, or bank login details \u2014 these are entered directly into the processor's secure system. We receive and store limited transaction information such as payment status, plan purchased, amount, and transaction reference, for the purpose of managing your subscription." },

  { type: "h2", text: "2.5 Technical and Usage Data" },
  { type: "p", text: "We may automatically collect device type, browser type, IP address, general location (city/country level), app usage patterns, and error/crash logs, to help us maintain and improve JAMBIFY." },

  { type: "h1", text: "3. How We Use Your Information" },
  { type: "p", text: "We use the information described above to:" },
  { type: "bullet", text: "Create and manage your account" },
  { type: "bullet", text: "Deliver core features: quizzes, mock exams, dashboards, and study groups" },
  { type: "bullet", text: "Process subscription payments and manage your plan" },
  { type: "bullet", text: "Personalize practice content and track your progress" },
  { type: "bullet", text: "Communicate with you about your account, support requests, or important updates" },
  { type: "bullet", text: "Detect, investigate, and prevent fraud, abuse, or violations of our Terms of Service" },
  { type: "bullet", text: "Improve JAMBIFY's features, performance, and reliability" },

  { type: "h1", text: "4. Legal Basis for Processing" },
  { type: "p", text: "We process your personal data in line with the Nigeria Data Protection Act 2023 (NDPA) and the Nigeria Data Protection Regulation (NDPR), on the following bases: your consent (given at signup), the necessity of processing to perform our contract with you (providing the app and paid features), and our legitimate interest in keeping JAMBIFY secure and functioning well." },

  { type: "h1", text: "5. Children and Minors" },
  { type: "p", text: "JAMBIFY is designed for JAMB/UTME candidates, many of whom are minors under Nigerian law (under 18). Where a user is a minor, we rely on the necessity of processing to provide requested educational services, and we limit data collection to what is reasonably needed to operate the app. Parents or guardians who believe their child has provided us with personal data beyond what is necessary, or who wish to review or delete such data, can contact us at support@jambify.com." },

  { type: "h1", text: "6. Sharing Your Information" },
  { type: "p", text: "We do not sell your personal data. We share information only with:" },
  { type: "bullet", text: "Supabase \u2014 our database, authentication, and realtime infrastructure provider" },
  { type: "bullet", text: "Payment processors (e.g. Flutterwave) \u2014 to process subscription payments" },
  { type: "bullet", text: "Hosting/infrastructure providers (e.g. Vercel) \u2014 to run and serve the app" },
  { type: "bullet", text: "Law enforcement or regulators, where required by Nigerian law or a valid legal request" },
  { type: "p", text: "Other members of a study group you join can see your display name and the messages you post in that group." },

  { type: "h1", text: "7. Data Storage and Security" },
  { type: "p", text: "Your data is stored on Supabase's infrastructure with encryption in transit and at rest. We apply reasonable technical and organizational measures \u2014 including access controls and row-level security \u2014 to protect your data from unauthorized access, loss, or misuse. However, no system is 100% secure, and we cannot guarantee absolute security." },

  { type: "h1", text: "8. Data Retention" },
  { type: "p", text: "We retain your account and academic performance data for as long as your account remains active, so that your history and progress are preserved. If you delete your account, we will delete or anonymize your personal data within a reasonable period, except where we are required to retain certain records (e.g. transaction records) for legal or accounting purposes." },

  { type: "h1", text: "9. Your Rights" },
  { type: "p", text: "Under the NDPA/NDPR, you have the right to:" },
  { type: "bullet", text: "Access the personal data we hold about you" },
  { type: "bullet", text: "Request correction of inaccurate or incomplete data" },
  { type: "bullet", text: "Request deletion of your personal data (\u201cright to be forgotten\u201d), subject to legal exceptions" },
  { type: "bullet", text: "Withdraw consent for processing that relies on consent" },
  { type: "bullet", text: "Object to or request restriction of certain processing" },
  { type: "bullet", text: "Request a copy of your data in a portable format" },
  { type: "p", text: "To exercise any of these rights, contact us at support@jambify.com. We will respond within a reasonable timeframe as required by applicable law." },

  { type: "h1", text: "10. Cookies and Similar Technologies" },
  { type: "p", text: "JAMBIFY may use local storage and cookies to keep you logged in, remember your preferences, and understand how the app is used. You can control cookies through your browser settings, though some features may not work properly if you disable them." },

  { type: "h1", text: "11. Third-Party Links" },
  { type: "p", text: "JAMBIFY may contain links to third-party websites or services (e.g. official JAMB resources). We are not responsible for the privacy practices of these third parties, and we encourage you to review their policies separately." },

  { type: "h1", text: "12. Changes to This Policy" },
  { type: "p", text: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will update the \u201cEffective Date\u201d above and, for material changes, notify you via the app or email." },

  { type: "h1", text: "13. Contact Us" },
  { type: "p", text: "If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, contact us at:" },
  { type: "bullet", text: "Email: support@jambify.com" },
  { type: "bullet", text: "WhatsApp: 07011872350" },
];

export const termsOfServiceContent: LegalBlock[] = [
  { type: "p", text: "These Terms of Service (\u201cTerms\u201d) govern your access to and use of JAMBIFY, a Progressive Web App for JAMB/UTME exam preparation, operated by [INSERT LEGAL/BUSINESS NAME] (\u201cJAMBIFY,\u201d \u201cwe,\u201d \u201cus,\u201d or \u201cour\u201d). By creating an account or using JAMBIFY, you agree to these Terms. If you do not agree, please do not use the app." },
  { type: "note", text: "Bracketed placeholders must be filled in before publishing. We recommend a quick review by a Nigeria-qualified lawyer before this goes live, especially around the payment and minors sections." },

  { type: "h1", text: "1. Eligibility and Accounts" },
  { type: "p", text: "JAMBIFY is intended for students preparing for JAMB/UTME. If you are under 18, you confirm that you have your parent's or guardian's permission to use JAMBIFY and, where relevant, to subscribe to a paid plan. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately at support@jambify.com if you suspect unauthorized use of your account." },

  { type: "h1", text: "2. Description of Service" },
  { type: "p", text: "JAMBIFY provides practice quizzes, mock exams, performance tracking, and study group features to help you prepare for JAMB/UTME. JAMBIFY is an independent exam-preparation tool and is not affiliated with, endorsed by, or operated by the Joint Admissions and Matriculation Board (JAMB) or any government body." },

  { type: "h1", text: "3. Subscriptions and Payment" },
  { type: "h2", text: "3.1 Plans" },
  { type: "p", text: "JAMBIFY offers both free and paid subscription plans. Paid plans may unlock additional features such as offline practice packs, extended mock exams, or advanced analytics, as described on our pricing page within the app at the time of purchase." },
  { type: "h2", text: "3.2 Billing" },
  { type: "p", text: "Payments are processed securely through a third-party payment processor. By subscribing, you authorize us (via our payment processor) to charge your chosen payment method for the applicable fees. Subscriptions may renew automatically unless cancelled before the renewal date; the specific renewal terms for your plan will be shown at checkout." },
  { type: "h2", text: "3.3 Cancellations and Refunds" },
  { type: "p", text: "You may cancel your subscription at any time from your account settings; cancellation will take effect at the end of your current billing period, and you will retain access to paid features until then. Except where required by Nigerian consumer protection law, or where we state otherwise for a specific promotion, fees already paid are non-refundable." },
  { type: "h2", text: "3.4 Price Changes" },
  { type: "p", text: "We may change subscription pricing from time to time. Any price change will apply from your next billing cycle onward, and we will make reasonable efforts to notify you in advance." },

  { type: "h1", text: "4. Acceptable Use" },
  { type: "p", text: "When using JAMBIFY, you agree not to:" },
  { type: "bullet", text: "Share your account with others or allow multiple people to use one paid subscription" },
  { type: "bullet", text: "Attempt to scrape, copy, redistribute, or resell JAMBIFY's question bank or content" },
  { type: "bullet", text: "Use bots, scripts, or automated tools to interact with the app" },
  { type: "bullet", text: "Post abusive, harassing, discriminatory, or otherwise inappropriate content in study group chats" },
  { type: "bullet", text: "Attempt to gain unauthorized access to other users' accounts or data" },
  { type: "bullet", text: "Use the app for any unlawful purpose or in violation of any applicable law" },
  { type: "p", text: "We reserve the right to suspend or terminate accounts that violate these rules." },

  { type: "h1", text: "5. Study Groups and User Content" },
  { type: "p", text: "Study group chat messages and any other content you post within JAMBIFY (\u201cUser Content\u201d) remain your responsibility. You grant JAMBIFY a limited license to store and transmit your User Content solely to operate the study group feature (e.g. delivering your messages to other group members). We may remove User Content that violates these Terms or applicable law." },

  { type: "h1", text: "6. Intellectual Property" },
  { type: "p", text: "All questions, explanations, branding, design, software, and other content provided by JAMBIFY (excluding User Content) are owned by or licensed to JAMBIFY and are protected by copyright and other intellectual property laws. You may use this content only for your personal, non-commercial exam preparation, and may not copy, distribute, or create derivative works from it without our written permission." },

  { type: "h1", text: "7. No Guarantee of Exam Results" },
  { type: "p", text: "JAMBIFY is a study aid designed to support your preparation. We do not guarantee any specific JAMB/UTME score, admission outcome, or exam result from using the app. Your results depend on many factors outside our control, including your own effort, official exam conditions, and JAMB's own policies and question formats." },

  { type: "h1", text: "8. Disclaimers" },
  { type: "p", text: "JAMBIFY is provided \u201cas is\u201d and \u201cas available,\u201d without warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the app will be uninterrupted, error-free, or completely secure." },

  { type: "h1", text: "9. Limitation of Liability" },
  { type: "p", text: "To the maximum extent permitted by Nigerian law, JAMBIFY and its operators shall not be liable for any indirect, incidental, special, or consequential damages, including loss of data, loss of profits, or exam-related outcomes, arising from your use of or inability to use the app. Our total liability for any claim relating to JAMBIFY shall not exceed the amount you paid us in the twelve (12) months preceding the claim." },

  { type: "h1", text: "10. Termination" },
  { type: "p", text: "You may stop using JAMBIFY and delete your account at any time. We may suspend or terminate your account, with or without notice, if we reasonably believe you have violated these Terms, engaged in fraudulent activity, or misused the platform. Upon termination, your right to use JAMBIFY ends immediately, though certain provisions of these Terms (e.g. intellectual property, limitation of liability) will continue to apply." },

  { type: "h1", text: "11. Changes to These Terms" },
  { type: "p", text: "We may update these Terms from time to time to reflect changes in our service or legal requirements. We will update the \u201cEffective Date\u201d above and, for material changes, notify you via the app or email. Continued use of JAMBIFY after changes take effect constitutes your acceptance of the updated Terms." },

  { type: "h1", text: "12. Governing Law" },
  { type: "p", text: "These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms or your use of JAMBIFY shall be subject to the exclusive jurisdiction of the courts of Nigeria." },

  { type: "h1", text: "13. Contact Us" },
  { type: "p", text: "If you have questions about these Terms, contact us at:" },
  { type: "bullet", text: "Email: support@jambify.com" },
  { type: "bullet", text: "WhatsApp: 07011872350" },
];