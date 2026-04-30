import { useEffect, useState } from 'react';

const IEFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isIE, setIsIE] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIe = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
    setIsIE(isIe);
  }, []);

  if (isIE) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
        <div className="max-w-md bg-[#18181F] rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-[#5B3BFF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Browser Not Supported</h1>
          <p className="text-[#9896B0] mb-6">
            Internet Explorer is no longer supported by JAMBIFY.
          </p>
          <p className="text-[#5C5A72] text-sm mb-6">
            Please use a modern browser like Microsoft Edge, Chrome, Firefox, or Safari.
          </p>
          <a
            href="https://www.microsoft.com/edge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#5B3BFF] hover:bg-[#7B5FFF] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Download Microsoft Edge
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default IEFallback;