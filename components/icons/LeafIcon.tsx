import React from 'react';

const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 20A7 7 0 0 1 4 13a7 7 0 0 1 7-7 7 7 0 0 1 7 7c0 1.92-1.5 3.5-4 4" />
    <path d="M12 4c2.5 0 5 2.5 5 5" />
    <path d="M4 13a7 7 0 0 1 7-7" />
  </svg>
);

export default LeafIcon;