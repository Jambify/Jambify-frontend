import React from "react";
import { X, Trophy, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

interface StreakCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

const getStreakMessage = (streak: number): { title: string; message: string; emoji: string } => {
  switch (streak) {
    case 1:
      return {
        title: "Great Start!",
        message: "You've completed your first day! Keep this momentum going!",
        emoji: "🌟"
      };
    case 2:
      return {
        title: "Two Days in a Row!",
        message: "Awesome! Consistency is key to success in JAMB!",
        emoji: "🔥"
      };
    case 3:
      return {
        title: "Three-Day Streak!",
        message: "You're on fire! Keep up the amazing work!",
        emoji: "🎉"
      };
    case 4:
      return {
        title: "Four Days Strong!",
        message: "Your dedication is impressive! Don't stop now!",
        emoji: "💪"
      };
    case 5:
      return {
        title: "Five-Day Streak!",
        message: "Wow! You're halfway to a full week! Keep it up!",
        emoji: "⭐"
      };
    case 6:
      return {
        title: "Almost a Week!",
        message: "One more day to hit a 7-day streak! You've got this!",
        emoji: "🎯"
      };
    case 7:
      return {
        title: "7-Day Streak!",
        message: "Incredible! You've completed a full week of practice! You're a JAMB champion!",
        emoji: "🏆"
      };
    default:
      return {
        title: "Keep Going!",
        message: "Your consistency is amazing! Keep practicing daily!",
        emoji: "✨"
      };
  }
};

const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  isOpen,
  onClose,
  streak,
}) => {
  const { title, message,  } = getStreakMessage(streak);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-bgCard border-borderMuted relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border p-8 shadow-2xl"
          >
            {/* Decorative top bar */}
            <div className="bg-brand absolute top-0 left-0 h-2 w-full" />

            <div className="text-center">
              {/* Emoji with animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="bg-brand/10 border-brand/20 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border text-4xl"
              >
                {streak >= 7 ? <Trophy size={40} className="text-brand" /> : <Flame size={40} className="text-orange-500" />}
              </motion.div>

              <h2 className="font-display mb-2 text-2xl font-black tracking-tight">
                {title}
              </h2>
              
              <div className="mb-6">
                <span className="text-textMain font-display text-5xl font-black">
                  {streak}
                </span>
                <span className="text-textDim ml-1 font-bold">day streak!</span>
              </div>

              <p className="text-textMuted mb-8 text-sm leading-relaxed font-medium">
                {message}
              </p>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={onClose}
                className="shadow-brand/20 font-black shadow-lg"
              >
                Keep Practicing!
              </Button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="hover:bg-bgSurface text-textDim absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StreakCelebrationModal;
