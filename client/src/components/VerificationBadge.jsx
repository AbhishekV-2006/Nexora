import React from 'react';

const VerificationBadge = ({ verified }) => {
  return (
    <span className="inline-flex items-center ml-2 text-sm">
      {verified ? (
        <span className="inline-flex items-center bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold border border-green-100">✓ Verified</span>
      ) : (
        <span className="inline-flex items-center bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full text-xs">Unverified</span>
      )}
    </span>
  );
};

export default VerificationBadge;
