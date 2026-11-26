import React from 'react';

const INK = '#0B0F1A';
const PAPER = '#FBF9F5';
const CLIENT = { main: '#3658FF' };

const Constellation = () => (
  <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g stroke="#FFFFFF" strokeOpacity="0.04" strokeWidth="0.12">
      <line x1="8" y1="14" x2="24" y2="28" />
      <line x1="24" y1="28" x2="18" y2="46" />
      <line x1="92" y1="10" x2="76" y2="24" />
      <line x1="76" y1="24" x2="84" y2="42" />
      <line x1="10" y1="88" x2="26" y2="74" />
      <line x1="90" y1="92" x2="74" y2="78" />
    </g>
  </svg>
);

const PageShell = ({ children, accent }) => {
  const glow = accent || CLIENT.main;
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: INK }}>
      <Constellation />

      <div className="relative w-full">
        <div className="pointer-events-none absolute -inset-2 rounded-[32px] blur-2xl opacity-20" style={{ backgroundColor: glow }} aria-hidden="true" />

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="relative rounded-[28px] p-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageShell;
