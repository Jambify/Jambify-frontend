// src/components/Settings/HelpSupport.tsx

import React, { useState } from "react";
import { Link } from "react-router";
import {
  HelpCircle,
  MessageSquare,
  Bug,
  FileText,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

// WhatsApp configuration
const WHATSAPP_NUMBER = "2347011872350"; // Full number without + or spaces
const WHATSAPP_MESSAGE = "Hi! I need help with Schooldra...";

const FAQ = [
  {
    question: "How do I change my subject combination?",
    answer:
      "Go to Settings → Profile and select your desired subject combination from the dropdown menu. Your practice questions and mock exams will update automatically.",
  },
  {
    question: "Are my practice sessions saved?",
    answer:
      "Yes! All your quiz and mock exam attempts are automatically saved to your account, and your performance stats are updated in real-time.",
  },
  {
    question: "How does the daily streak work?",
    answer:
      "Your streak is counted as consecutive days where you complete at least one quiz or mock exam. If you miss a day, your streak resets to zero!",
  },
  {
    question: "Can I practice offline?",
    answer:
      "Yes! Pro users can download offline practice packs. Go to the Offline Packs page to download questions for your subjects.",
  },
];

const HelpSupport: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [bugReport, setBugReport] = useState("");
  const [bugEmail, setBugEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleReportBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugReport.trim() || !bugEmail.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Replace 'YOUR_FORMSPREE_ID' with your actual Formspree endpoint ID
      const response = await fetch("https://formspree.io/f/xykqnlpn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: bugEmail,
          message: bugReport,
          subject: "Bug Report from Schooldra App",
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setBugReport("");
        setBugEmail("");
        // Reset status after 5 seconds
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        throw new Error("Submission failed");
      }
    } catch{
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contact Support */}
      <section className="bg-bgCard border-borderMuted rounded-brand-xl border p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-brand/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <MessageSquare className="text-brand h-5 w-5" />
          </div>
          <div>
            <h3 className="text-textMain font-semibold">Contact Support</h3>
            <p className="text-textDim text-sm">Need help? Send us a message</p>
          </div>
        </div>
        <div className="space-y-3">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-green-700 active:scale-95"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>

          {/* Email */}
          <a
            href="mailto:support@schooldra.com"
            className="text-brand hover:text-brand-light flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Mail size={16} />
            support@schooldra.com
          </a>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-bgCard border-borderMuted rounded-brand-xl border p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-brand/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <HelpCircle className="text-brand h-5 w-5" />
          </div>
          <div>
            <h3 className="text-textMain font-semibold">
              Frequently Asked Questions
            </h3>
            <p className="text-textDim text-sm">
              Quick answers to common questions
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {FAQ.map((faq, index) => (
            <div key={index} className="border-borderMuted rounded-lg border">
              <button
                onClick={() => toggleFaq(index)}
                className="hover:bg-bgSurface/50 flex w-full items-center justify-between p-3 text-left transition-colors"
              >
                <span className="text-textMain text-sm font-medium">
                  {faq.question}
                </span>
                {expandedFaq === index ? (
                  <ChevronUp className="text-textDim h-4 w-4" />
                ) : (
                  <ChevronDown className="text-textDim h-4 w-4" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-3 pb-3">
                  <p className="text-textDim text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Report a Bug */}
      <section className="bg-bgCard border-borderMuted rounded-brand-xl border p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-brand/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Bug className="text-brand h-5 w-5" />
          </div>
          <div>
            <h3 className="text-textMain font-semibold">Report a Bug</h3>
            <p className="text-textDim text-sm">Found an issue? Let us know</p>
          </div>
        </div>
        <form onSubmit={handleReportBug} className="space-y-3">
          <div>
            <label className="text-textDim mb-1 block text-xs font-medium">
              Your Email
            </label>
            <input
              type="email"
              value={bugEmail}
              onChange={(e) => setBugEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-bgSurface border-borderMuted text-textMain focus:ring-brand/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-textDim mb-1 block text-xs font-medium">
              What happened?
            </label>
            <textarea
              value={bugReport}
              onChange={(e) => setBugReport(e.target.value)}
              placeholder="Describe the bug in detail..."
              rows={4}
              className="bg-bgSurface border-borderMuted text-textMain focus:ring-brand/30 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
          {submitStatus === "success" && (
            <div className="rounded-lg border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              ✓ Bug report submitted successfully! We'll look into it soon.
            </div>
          )}
          {submitStatus === "error" && (
            <div className="rounded-lg border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              ✗ Failed to submit bug report. Please try again or email us
              directly.
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-light w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? "Sending..." : "Send Bug Report"}
          </button>
        </form>
      </section>

      {/* Legal Links */}
      <section className="bg-bgCard border-borderMuted rounded-brand-xl border p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-brand/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <FileText className="text-brand h-5 w-5" />
          </div>
          <div>
            <h3 className="text-textMain font-semibold">Legal</h3>
            <p className="text-textDim text-sm">
              Privacy policy and terms of service
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Link
            to="/privacy-policy"
            className="text-textDim hover:text-textMain hover:bg-bgSurface/50 flex items-center justify-between rounded-lg p-2 text-sm transition-colors"
          >
            <span>Privacy Policy</span>
            <ExternalLink size={14} />
          </Link>
          <Link
            to="/terms-of-service"
            className="text-textDim hover:text-textMain hover:bg-bgSurface/50 flex items-center justify-between rounded-lg p-2 text-sm transition-colors"
          >
            <span>Terms of Service</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpSupport;
