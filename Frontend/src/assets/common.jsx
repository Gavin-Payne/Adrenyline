import React from 'react';

const CommonIcon = ({ size = 16, color = '#E0E0E0' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
  </svg>
);

export default CommonIcon;