import React from 'react';
import AppLayout from '../components/Layout/AppLayout';
import Button from '../components/ui/Button';

const MockExams: React.FC = () => {
  return (
    <AppLayout currentPage="mock-exams">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-brand/20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 bg-bgCard border border-borderMuted rounded-3xl flex items-center justify-center shadow-2xl animate-bounce-slow">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              className="text-brand-light"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-[11px] font-bold uppercase tracking-widest mb-2">
            Release v2.0
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-textMain tracking-tighter leading-tight">
            Full-Scale Mock Exams <br /> 
            <span className="text-textDim">Are Coming Soon.</span>
          </h1>
          <p className="text-textDim text-lg max-w-lg mx-auto leading-relaxed">
            We're building a 1:1 simulation of the official JAMB CBT environment. 
            Timed sessions, all 4 subjects, and instant national ranking.
          </p>
        </div>

        {/* Feature Teaser Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-12">
          {[
            { title: "Real Timer", desc: "Official CBT countdown", icon: "⏲️" },
            { title: "All Subjects", desc: "4-in-1 exam mode", icon: "📚" },
            { title: "Live Ranking", desc: "Compare with thousands", icon: "📈" },
          ].map((feature, i) => (
            <div key={i} className="bg-bgCard border border-borderMuted p-4 rounded-brand-xl text-left">
              <span className="text-2xl mb-2 block">{feature.icon}</span>
              <h3 className="font-bold text-sm text-textMain">{feature.title}</h3>
              <p className="text-[11px] text-textDim">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Waitlist/CTA */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Button variant="primary" fullWidth>
            🚀 Notify Me on Launch
          </Button>
          <Button variant="secondary" fullWidth onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>

        <p className="mt-8 text-[11px] text-textDim uppercase tracking-widest font-medium">
          Estimated Release: May 2026
        </p>
      </div>
    </AppLayout>
  );
};

export default MockExams;