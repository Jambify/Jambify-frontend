import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, GraduationCap, ShieldCheck } from 'lucide-react';

const MentorChat: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AppLayout currentPage="mentor" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6">
        
        {/* Animated Icon with "Verified" badge */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-10"
        >
          <div className="w-28 h-28 bg-brand/10 rounded-full flex items-center justify-center border-2 border-brand/20 relative z-10">
            <MessageSquare className="text-brand-light w-12 h-12" />
          </div>
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg z-20"
          >
            <ShieldCheck size={20} />
          </motion.div>
          <div className="absolute inset-0 bg-brand/10 blur-3xl rounded-full -z-10" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
            Connect with <span className="text-brand-light">Expert Mentors</span>
          </h1>
          <p className="text-textDim max-w-lg mx-auto mb-10 leading-relaxed text-lg">
            Direct access to top-scoring JAMB veterans and subject experts is almost here. Get the guidance you need to bridge your score gap.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-brand hover:bg-brand-light text-blue rounded-brand font-bold transition-all shadow-lg shadow-brand/20"
            >
              Back to Dashboard
            </button>
            <p className="text-sm text-textMuted font-medium italic">
              Launching in Phase 2
            </p>
          </div>
        </motion.div>

        {/* Feature Teasers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 max-w-3xl w-full">
          <div className="flex items-start gap-4 p-6 bg-bgCard border border-borderMuted rounded-brand-xl text-left">
            <div className="p-2 bg-brand/10 rounded-lg text-brand-light"><Sparkles size={20}/></div>
            <div>
              <h4 className="font-bold text-textMain mb-1">Score Strategy</h4>
              <p className="text-xs text-textDim leading-relaxed">Personalized tips on how to manage time and tackle complex questions.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-bgCard border border-borderMuted rounded-brand-xl text-left">
            <div className="p-2 bg-brand/10 rounded-lg text-brand-light"><GraduationCap size={20}/></div>
            <div>
              <h4 className="font-bold text-textMain mb-1">Subject Mastery</h4>
              <p className="text-xs text-textDim leading-relaxed">Stuck on a Physics law? Ask a mentor for a simplified breakdown.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MentorChat;