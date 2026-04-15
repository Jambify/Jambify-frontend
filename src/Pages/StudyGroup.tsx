import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { User } from 'lucide-react';


const ComingSoon: React.FC<{ featureName: string }> = ({ featureName }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <AppLayout currentPage="groups" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        {/* Animated Icon Container */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 bg-brand/10 rounded-3xl flex items-center justify-center border border-brand/20 relative z-10">
            <User className="text-brand-light w-10 h-10" />
          </div>
          {/* Subtle background pulses */}
          <div className="absolute inset-0 bg-brand/20 blur-3xl animate-pulse -z-10" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-display font-bold mb-4">
            {featureName} is <span className="text-brand-light">incoming</span>
          </h1>
          <p className="text-textDim max-w-md mx-auto mb-8 leading-relaxed">
            We're building a space where you can collaborate with top students and smash your JAMB goals together. This feature will be live in a few weeks!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              onClick={() => navigate('/')}
              className="px-8"
            >
              Back to Dashboard
            </Button>
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-brand text-sm text-textMain font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
              Notify me when live
            </div>
          </div>
        </motion.div>

        {/* Sneak peek cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-4xl w-full">
          {[
            { title: "Live Discussions", desc: "Real-time subject chats" },
            { title: "Shared Resources", desc: "Peer-to-peer note sharing" },
            { title: "Group Challenges", desc: "Compete in weekly tasks" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="p-5 bg-bgSurface border border-borderMuted rounded-brand-lg text-left"
            >
              <h3 className="text-brand-light font-bold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-textDim">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ComingSoon;