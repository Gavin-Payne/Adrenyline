import React from 'react';
import { tipBoxStyle } from '../../styles/components/layout.styles';
import { colors } from '../../styles/theme';

const Tips = () => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={tipBoxStyle}>
        <p>
          <strong style={{ color: colors.text.highlight }}>Position Guide:</strong>{" "}
          The <strong style={{ color: 'cyan' }}>CYAN</strong> text shows your betting position.
          The seller takes the opposite position.
        </p>
      </div>

      <div style={tipBoxStyle}>
        <p>
          <strong style={{ color: colors.text.highlight }}>Payouts:</strong>{" "}
          Check the <strong style={{ color: colors.text.accent }}>TOTAL</strong> for potential winnings.
          Winner receives the entire pot.
        </p>
      </div>

      <div style={tipBoxStyle}>
        <p>
          <strong style={{ color: colors.text.highlight }}>Time Colors:</strong>{" "}
          Green means plenty of time left, yellow is getting close, red is almost expired.
        </p>
      </div>

      <div style={tipBoxStyle}>
        <p>
          <strong style={{ color: colors.text.highlight }}>Search:</strong>{" "}
          Use the filters above to find specific games, players, or metrics.
        </p>
      </div>
    </div>
  );
};

export default Tips;