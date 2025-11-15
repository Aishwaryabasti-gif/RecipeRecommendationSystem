import React from 'react';

const ChefHatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M10 21.25c.6-1 1.5-1.25 2-1.25s1.4.25 2 1.25" />
    <path d="M12 4a3 3 0 0 1 3 3c0 1.4-1.5 2.5-3 2.5S9 8.4 9 7a3 3 0 0 1 3-3Z" />
    <path d="M5 12a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
    <path d="M7 16a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z" />
  </svg>
);

export default ChefHatIcon;