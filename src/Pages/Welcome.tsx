import React, { useEffect, useState } from 'react';
import { useNavigate }                from 'react-router-dom';
import { useUserStore }               from '../Store/UseUserStore';
import { motion }                     from 'framer-motion';
import Button                         from '../components/ui/Button';
import { CheckCircle, Sparkles, Trophy, Target } from 'lucide-react';

const REDIRECT_SECS = 8;

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  // FIX: pull markWelcomeAsSeen from the store
  const {
    name, subjectCombo, targetScore, university,
    markWelcomeAsSeen,
  } = useUserStore();

  const [showConfetti, setShowConfetti] = useState(false);

  // ── FIX: call markWelcomeAsSeen before every navigate('/') ─
  const goToDashboard = () => {
    markWelcomeAsSeen();   // sets onboardingComplete: true, hasSeenWelcome: true
    navigate('/', { replace: true });
  };

  useEffect(() => {
    setShowConfetti(true);

    // Auto-navigate after countdown
    const timer = setTimeout(() => {
      goToDashboard();  // ← was navigate('/') — now calls markWelcomeAsSeen first
    }, REDIRECT_SECS * 1000);

    return () => clearTimeout(timer);
  }, []);   // empty deps — only runs once on mount

  const getSubjectLabel = (combo: string) => {
    const labels: Record<string, string> = {
      'medicine':    'Medicine & Pharmacy',
      'engineering': 'Engineering & Tech',
      'social-sci':  'Social Sciences',
      'law':         'Law & Arts',
    };
    return labels[combo] || combo;
  };

  return (
    <div className="min-h-screen bg-bgMain text-textMain flex flex-col items-center justify-center p-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: Math.random() * 400 - 200, y: -50, rotate: Math.random() * 360 }}
              animate={{ y: 900, rotate: Math.random() * 720 }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 5,
              }}
              className="absolute w-2 h-2 bg-brand rounded-full opacity-70"
              style={{ left: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center font-bold text-white text-xl">J</div>
        <span className="font-bold text-2xl tracking-tight">
          JAMB<span className="text-brand">IFY</span>
        </span>
      </div>

      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-bgCard border border-borderMuted rounded-brand-2xl p-8 text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/30"
          >
            <CheckCircle className="w-10 h-10 text-success" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-display font-bold text-textMain mb-2"
          >
            Welcome, {name}! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-textDim mb-8"
          >
            You're all set to ace your JAMB exams!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-8"
          >
            {[
              { icon: <Target className="w-5 h-5 text-brand-light" />, label: 'Target University', value: university || 'Not specified' },
              { icon: <Sparkles className="w-5 h-5 text-brand-light" />, label: 'Subject Track',    value: getSubjectLabel(subjectCombo) },
              { icon: <Trophy className="w-5 h-5 text-brand-light" />,   label: 'Target Score',    value: targetScore || 'Not set' },
            ].map(card => (
              <div key={card.label} className="bg-bgSurface border border-borderMuted rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  {card.icon}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-textMain">{card.label}</p>
                    <p className="text-xs text-textDim">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              onClick={goToDashboard} 
              className="w-full"
              variant="primary"
            >
              Start Your Journey
            </Button>
            <p className="text-xs text-textDim">
              Redirecting in {REDIRECT_SECS} seconds…
            </p>
          </motion.div>

          <div className="mt-4 h-1 bg-bgSurface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }} animate={{ width: '100%' }}
              transition={{ duration: REDIRECT_SECS, ease: 'linear' }}
              className="h-full bg-brand rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-textDim">
            <span className="font-semibold text-brand-light">Pro Tip:</span> Start with a quiz to assess your current level!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;