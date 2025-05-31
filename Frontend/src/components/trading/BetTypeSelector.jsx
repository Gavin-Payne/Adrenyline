import React from 'react';
import PropTypes from 'prop-types';
import { modernSelectStyle } from '../../styles/components/forms.styles';

const BetTypeSelector = ({ betType, onBetTypeChange, allowedTypes = ['silver', 'gold'] }) => (
  <select
    value={betType}
    onChange={onBetTypeChange}
    style={modernSelectStyle}
    required
  >
    <option value="">Select Currency</option>
    {allowedTypes.includes('silver') && <option value="silver">Silver</option>}
    {allowedTypes.includes('gold') && <option value="gold">Gold</option>}
  </select>
);

BetTypeSelector.propTypes = {
  betType: PropTypes.string.isRequired,
  onBetTypeChange: PropTypes.func.isRequired,
  allowedTypes: PropTypes.arrayOf(PropTypes.string)
};

export default BetTypeSelector;