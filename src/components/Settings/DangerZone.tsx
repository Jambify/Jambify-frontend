import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../Store/UseUserStore';
import Button from '../ui/Button';
import { Section,} from './Shared';
const DangerZone: React.FC = () => {
  const navigate      = useNavigate();
  const resetAccount  = useUserStore((s) => s.resetAccount);
  const [confirm, setConfirm] = useState(false);

  const handleReset = () => {
    resetAccount();
    navigate('/onboarding');
  };

  return (
    <div className="flex flex-col gap-5">

      {/* <App info */}
      <Section title="About">
        <div className="flex flex-col gap-3">
          {[
            ['App version',  '1.0.0'],
            ['Platform',     'Web + Mobile'],
            ['Data storage', 'Local (no account needed yet)'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-borderMuted last:border-0">
              <span className="text-sm text-textMuted">{label}</span>
              <span className="text-sm text-textMain font-medium">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* <Danger zone */}
      <Section title="Danger zone">
        <div className="bg-danger/5 border border-danger/20 rounded-brand-lg p-4">
          <p className="text-sm font-medium text-textMain mb-1">Reset all progress</p>
          <p className="text-xs text-textMuted mb-4">
            This will clear your profile, quiz history, and all progress data.
            You will be taken back to the onboarding screen. This cannot be undone.
          </p>

          {!confirm ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirm(true)}
            >
              Reset everything
            </Button>
          ) : (
            <div>
              <p className="text-sm text-danger font-medium mb-3">
                ⚠️ Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleReset}
                >
                  Yes, reset everything
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>

    </div>
  );
};

export default DangerZone;
