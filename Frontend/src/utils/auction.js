import React from 'react';

export const getOppositeOffer = (condition, value, metric) => {
  const lowerCondition = condition.toLowerCase();
  let opposite;
  if (lowerCondition === "over") {
    opposite = "Under";
  } else if (lowerCondition === "under") {
    opposite = "Over";
  } else if (lowerCondition === "exactly") {
    opposite = "Not exactly";
  } else if (lowerCondition === "not exactly") {
    opposite = "Exactly";
  } else {
    opposite = condition;
  }
  return (
    <span>
      <strong style={{ color: 'cyan' }}>{opposite}</strong> {value} {metric}
    </span>
  );
};

export const removeDiacritics = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};