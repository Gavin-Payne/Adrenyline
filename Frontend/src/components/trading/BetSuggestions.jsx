import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaArrowRight, FaSpinner, FaCalendarAlt, FaExclamationCircle } from 'react-icons/fa';

const BetSuggestions = ({ selectedDate, token, onSuggestionSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noSuggestions, setNoSuggestions] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!selectedDate || !token) return;
      setLoading(true);
      setError(null);
      setNoSuggestions(false);
      try {
        const response = await fetch(
          `process.env.REACT_APP_API_URL/suggestions/bet-suggestions?date=${selectedDate}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data = await response.json();
        if (data.noSuggestions) {
          setNoSuggestions(true);
          setMessage(data.message);
          setSuggestions([]);
        } else {
          setSuggestions(data);
          setNoSuggestions(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [selectedDate, token]);

  if (!selectedDate) {
    return (
      <div style={styles.container}>
        <div style={styles.header} onClick={() => setExpanded(!expanded)}>
          <h3 style={styles.title}>
            <FaLightbulb style={{ marginRight: '10px', color: '#FFC107' }} />
            Betting Suggestions
          </h3>
          <motion.div animate={{ rotate: expanded ? 0 : 180 }} transition={{ duration: 0.3 }}>
            <span style={{ fontSize: '24px', cursor: 'pointer' }}>{expanded ? '▾' : '▴'}</span>
          </motion.div>
        </div>
        {expanded && (
          <div style={styles.emptyContainer}>
            <FaCalendarAlt size={24} color="#6C5CE7" />
            <p>Select a date to see popular betting suggestions</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <h3 style={styles.title}>
          <FaLightbulb style={{ marginRight: '10px', color: '#FFC107' }} />
          Betting Suggestions
        </h3>
        <motion.div animate={{ rotate: expanded ? 0 : 180 }} transition={{ duration: 0.3 }}>
          <span style={{ fontSize: '24px', cursor: 'pointer' }}>{expanded ? '▾' : '▴'}</span>
        </motion.div>
      </div>
      {expanded && (
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div style={styles.loadingContainer}>
                <FaSpinner className="spin" size={24} />
                <p>Loading suggestions...</p>
              </div>
            ) : error ? (
              <div style={styles.errorContainer}>
                <FaExclamationCircle size={24} />
                <p>{error}</p>
              </div>
            ) : noSuggestions ? (
              <div style={styles.noSuggestionsContainer}>
                <FaCalendarAlt size={32} style={{ marginBottom: '15px', opacity: 0.7 }} />
                <h4 style={{ margin: '0 0 10px 0' }}>No Popular Bets Yet</h4>
                <p>{message || 'Check back soon for popular betting suggestions'}</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div style={styles.emptyContainer}>
                <p>No suggestions available for this date</p>
              </div>
            ) : (
              <div style={styles.suggestionsGrid}>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    style={styles.suggestionCard}
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                    onClick={() => onSuggestionSelect(suggestion)}
                  >
                    {suggestion.popularity && (
                      <div style={styles.popularityBadge}>
                        <FaLightbulb size={12} style={{ marginRight: '4px' }} />
                        {suggestion.popularity}
                      </div>
                    )}
                    <h4 style={styles.playerName}>{suggestion.player}</h4>
                    <div style={styles.suggestionDetails}>
                      <span style={styles.metric}>
                        {suggestion.metric} {suggestion.condition} {suggestion.value}
                      </span>
                      <span
                        style={{
                          ...styles.confidence,
                          backgroundColor:
                            suggestion.confidence === 'high'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : suggestion.confidence === 'medium'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                          color:
                            suggestion.confidence === 'high'
                              ? '#10B981'
                              : suggestion.confidence === 'medium'
                              ? '#F59E0B'
                              : '#EF4444',
                        }}
                      >
                        {suggestion.confidence}
                      </span>
                    </div>
                    <p style={styles.recommendation}>{suggestion.recommendation}</p>
                    <div style={styles.useButton}>
                      Use <FaArrowRight style={{ marginLeft: '5px' }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'rgba(30, 30, 45, 0.7)',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
  },
  title: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    color: '#FFFFFF',
    fontSize: '18px',
  },
  loadingContainer: {
    padding: '30px',
    textAlign: 'center',
    color: '#B0B0C0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  errorContainer: {
    padding: '20px',
    textAlign: 'center',
    color: '#EF4444',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  emptyContainer: {
    padding: '30px',
    textAlign: 'center',
    color: '#B0B0C0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  noSuggestionsContainer: {
    padding: '30px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#B0B0C0',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    margin: '15px',
  },
  suggestionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px',
    padding: '15px',
  },
  suggestionCard: {
    backgroundColor: 'rgba(40, 40, 60, 0.7)',
    borderRadius: '10px',
    padding: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(5px)',
    position: 'relative',
  },
  popularityBadge: {
    position: 'absolute',
    top: '-10px',
    right: '10px',
    backgroundColor: '#6C5CE7',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  playerName: {
    margin: '0 0 10px 0',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  suggestionDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  metric: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#6366F1',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  confidence: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  recommendation: {
    fontSize: '14px',
    color: '#B0B0C0',
    marginBottom: '15px',
    lineHeight: 1.4,
  },
  useButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 0',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#6366F1',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
};

export default BetSuggestions;