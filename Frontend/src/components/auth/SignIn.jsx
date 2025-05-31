import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/authService';
import { GoogleLogin } from '@react-oauth/google';
import { FaGoogle, FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa';

function SignIn({ setToken }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!usernameOrEmail.trim() || !password) {
      setError('Username/Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.signin(usernameOrEmail, password);

      setLoading('success');
      setTimeout(() => {
        setToken(response.token);
      }, 1000);
    } catch (error) {
      setError(error.message || 'Invalid username/email or password');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.googleSignIn(credentialResponse.credential);

      setLoading('success');
      setTimeout(() => {
        setToken(response.token);
      }, 1000);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Google sign in failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError('Google sign in failed. Please try again or use email/password.');
  };

  return (
    <motion.div 
      style={containerStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.form 
        onSubmit={handleSubmit} 
        style={formStyle}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          delay: 0.2
        }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 style={headerStyle}>
            Welcome Back
            <motion.div 
              style={underlineStyle} 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.6, duration: 0.5 }}
            />
          </h2>
          <p style={subtitleStyle}>Sign in to continue your trading journey</p>
        </motion.div>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              style={errorContainerStyle}
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <FaExclamationCircle style={{ marginRight: '8px' }} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          style={{
            ...inputContainerStyle,
            borderColor: focusedField === 'email' ? '#6366F1' : '#444'
          }}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.995 }}
        >
          <FaEnvelope style={{
            ...iconStyle,
            color: focusedField === 'email' ? '#6366F1' : '#777'
          }} />
          <input
            type="text"
            placeholder="Username or Email"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            style={inputStyle}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
        </motion.div>
        
        <motion.div 
          style={{
            ...inputContainerStyle,
            borderColor: focusedField === 'password' ? '#6366F1' : '#444'
          }}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.995 }}
        >
          <FaLock style={{
            ...iconStyle,
            color: focusedField === 'password' ? '#6366F1' : '#777'
          }} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
        </motion.div>
        
        <motion.button 
          type="submit" 
          style={loading === 'success' ? successButtonStyle : buttonStyle}
          disabled={loading}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={loading ? {} : { scale: 1.03, boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)' }}
          whileTap={loading ? {} : { scale: 0.97 }}
        >
          {loading === true && (
            <div style={spinnerStyle}></div>
          )}
          {loading === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
              style={checkmarkContainerStyle}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <motion.path
                  d="M5 10L8.5 13.5L15 7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
            </motion.div>
          )}
          {loading === true ? 'Signing in...' : loading === 'success' ? 'Success!' : 'Sign In'}
        </motion.button>

        <motion.div 
          style={orDividerStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span style={orTextStyle}>OR</span>
        </motion.div>

        <motion.div 
          style={googleButtonContainer}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            type="standard"
            theme="filled_black"
            size="large"
            text="signin_with"
            shape="pill"
            logo_alignment="center"
            width="280"
            render={({ onClick, disabled }) => (
              <motion.button
                type="button"
                onClick={onClick}
                disabled={disabled || loading}
                style={googleButtonStyle}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.25)' 
                }}
                whileTap={{ scale: 0.97 }}
                initial={{ scale: 1 }}
                animate={{ 
                  scale: [1, 1.02, 1],
                  transition: { repeat: 0, duration: 0.3 }
                }}
              >
                <div style={googleLogoContainer}>
                  <svg width="20" height="20" viewBox="0 0 186.69 190.5">
                    <g transform="translate(1184.583 765.171)">
                      <path clipPath="none" mask="none" d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z" fill="#4285f4"/>
                      <path clipPath="none" mask="none" d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z" fill="#34a853"/>
                      <path clipPath="none" mask="none" d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z" fill="#fbbc05"/>
                      <path d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z" fill="#ea4335" clipPath="none" mask="none"/>
                    </g>
                  </svg>
                </div>
                <span style={googleButtonTextStyle}>Sign in with Google</span>
                {loading === true && <div style={spinnerStyle}></div>}
              </motion.button>
            )}
          />
        </motion.div>
        
        <motion.p 
          style={footerTextStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          First time here? <span style={footerLinkStyle}>Create an account</span>
        </motion.p>
      </motion.form>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}

const containerStyle = {
  width: '100%',
  maxWidth: '430px',
  margin: '0 auto',
  perspective: '1000px',
};

const formStyle = {
  backgroundColor: '#1c1c28',
  padding: '35px',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
};

const headerStyle = {
  textAlign: 'center',
  color: '#ffffff',
  fontSize: '1.8rem',
  fontWeight: '700',
  margin: '0 0 5px 0',
  position: 'relative',
  display: 'inline-block',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const underlineStyle = {
  position: 'absolute',
  bottom: '-5px',
  left: '0',
  height: '3px',
  backgroundColor: '#6366F1',
  borderRadius: '2px',
};

const subtitleStyle = {
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: '0.9rem',
  marginTop: '8px',
  marginBottom: '10px',
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  overflow: 'hidden',
};

const iconStyle = {
  position: 'absolute',
  left: '16px',
  fontSize: '1em',
  transition: 'color 0.2s ease',
};

const inputStyle = {
  width: '100%',
  padding: '16px 16px 16px 48px',
  border: 'none',
  fontSize: '1em',
  backgroundColor: 'transparent',
  color: '#fff',
  outline: 'none',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const buttonStyle = {
  padding: '15px',
  backgroundColor: '#6366F1',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1em',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
};

const successButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#22c55e',
  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
};

const errorContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  borderLeft: '3px solid #ef4444',
  borderRadius: '6px',
  color: '#f87171',
  fontSize: '0.9em',
  overflow: 'hidden',
};

const orDividerStyle = {
  position: 'relative',
  textAlign: 'center',
  margin: '10px 0',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '0',
    right: '0',
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
};

const orTextStyle = {
  display: 'inline-block',
  padding: '0 15px',
  backgroundColor: '#1c1c28',
  color: '#94a3b8',
  position: 'relative',
  fontSize: '0.9em',
};

const googleButtonContainer = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '5px',
};

const googleButtonStyle = {
  padding: '15px',
  backgroundColor: '#4285f4',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1em',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  boxShadow: '0 4px 12px rgba(66, 133, 244, 0.2)',
};

const googleLogoContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const googleButtonTextStyle = {
  marginLeft: '10px',
};

const footerTextStyle = {
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: '0.9em',
  marginTop: '10px',
  marginBottom: '0',
};

const footerLinkStyle = {
  color: '#6366F1',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'color 0.2s',
  '&:hover': {
    color: '#4f46e5',
    textDecoration: 'underline',
  }
};

const spinnerStyle = {
  width: '18px',
  height: '18px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '50%',
  borderTop: '2px solid white',
  animation: 'spin 0.8s linear infinite',
};

const checkmarkContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default SignIn;
