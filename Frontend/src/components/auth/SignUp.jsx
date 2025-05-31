import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/authService';
import { FaUser, FaEnvelope, FaLock, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

function SignUp({ setToken }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [formStage, setFormStage] = useState(0);

  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;
  const passwordStrength = 
    (hasMinLength ? 1 : 0) + 
    (hasUppercase ? 1 : 0) + 
    (hasNumber ? 1 : 0);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getProgressColor = () => {
    if (passwordStrength === 0) return '#ef4444';
    if (passwordStrength === 1) return '#f97316';
    if (passwordStrength === 2) return '#eab308';
    return '#22c55e';
  };

  const handleNext = () => {
    if (!username.trim()) {
      setErrorMessage('Username is required');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setErrorMessage('');
    setFormStage(1);
  };

  const handleBack = () => {
    setFormStage(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formStage === 0) {
      handleNext();
      return;
    }
    
    setErrorMessage('');
    setLoading(true);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const data = await authService.signup(username, email, password);

      setLoading('success');
      
      setTimeout(() => {
        if (data.token) {
          setToken(data.token);
        } else {
          authService.signin(username, password)
            .then(response => setToken(response.token))
            .catch(err => {
              console.error('Auto-login failed:', err);
              setErrorMessage('Account created but login failed. Please sign in manually.');
              setLoading(false);
            });
        }
      }, 1000);
    } catch (error) {
      setErrorMessage(error.message || 'Error creating account');
      setLoading(false);
    }
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
            Create Account
            <motion.div 
              style={underlineStyle} 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.6, duration: 0.5 }}
            />
          </h2>
          <p style={subtitleStyle}>Join the community of sports traders</p>
        </motion.div>
        
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              style={errorContainerStyle}
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <FaExclamationCircle style={{ marginRight: '8px' }} />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          {formStage === 0 ? (
            <motion.div
              key="stage1"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.div 
                style={{
                  ...inputContainerStyle,
                  borderColor: focusedField === 'username' ? '#6366F1' : '#444'
                }}
                whileTap={{ scale: 0.995 }}
              >
                <FaUser style={{
                  ...iconStyle,
                  color: focusedField === 'username' ? '#6366F1' : '#777'
                }} />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                />
              </motion.div>
              
              <motion.div 
                style={{
                  ...inputContainerStyle,
                  borderColor: focusedField === 'email' ? '#6366F1' : '#444',
                  marginTop: '20px'
                }}
                whileTap={{ scale: 0.995 }}
              >
                <FaEnvelope style={{
                  ...iconStyle,
                  color: focusedField === 'email' ? '#6366F1' : '#777'
                }} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="stage2"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.div 
                style={{
                  ...inputContainerStyle,
                  borderColor: focusedField === 'password' ? '#6366F1' : '#444'
                }}
                whileTap={{ scale: 0.995 }}
              >
                <FaLock style={{
                  ...iconStyle,
                  color: focusedField === 'password' ? '#6366F1' : '#777'
                }} />
                <input
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
              </motion.div>
              
              {/* Password strength indicator */}
              {password.length > 0 && (
                <motion.div 
                  style={strengthContainerStyle}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={strengthLabelStyle}>
                    Password strength:
                  </div>
                  <div style={strengthBarContainerStyle}>
                    <motion.div 
                      style={{
                        ...strengthBarStyle,
                        width: `${(passwordStrength / 3) * 100}%`,
                        backgroundColor: getProgressColor()
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength / 3) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div style={strengthChecksStyle}>
                    <div style={{ opacity: hasMinLength ? 1 : 0.5 }}>
                      <FaCheckCircle 
                        style={{ 
                          marginRight: '4px', 
                          color: hasMinLength ? '#22c55e' : '#6b7280',
                          fontSize: '12px'
                        }} 
                      />
                      <span>Min. 6 characters</span>
                    </div>
                    <div style={{ opacity: hasUppercase ? 1 : 0.5 }}>
                      <FaCheckCircle 
                        style={{ 
                          marginRight: '4px', 
                          color: hasUppercase ? '#22c55e' : '#6b7280',
                          fontSize: '12px'
                        }} 
                      />
                      <span>Uppercase letter</span>
                    </div>
                    <div style={{ opacity: hasNumber ? 1 : 0.5 }}>
                      <FaCheckCircle 
                        style={{ 
                          marginRight: '4px', 
                          color: hasNumber ? '#22c55e' : '#6b7280',
                          fontSize: '12px'
                        }} 
                      />
                      <span>Number</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <motion.div 
                style={{
                  ...inputContainerStyle,
                  borderColor: focusedField === 'confirmPassword' ? '#6366F1' : '#444',
                  marginTop: '20px'
                }}
                whileTap={{ scale: 0.995 }}
              >
                <FaLock style={{
                  ...iconStyle,
                  color: focusedField === 'confirmPassword' ? '#6366F1' : '#777'
                }} />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                />
              </motion.div>
              
              {/* Password match indicator */}
              {confirmPassword.length > 0 && (
                <motion.div 
                  style={{
                    ...matchIndicatorStyle,
                    backgroundColor: passwordsMatch ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: passwordsMatch ? '#22c55e' : '#ef4444'
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {passwordsMatch ? (
                    <>
                      <FaCheckCircle style={{ color: '#22c55e', marginRight: '8px' }} />
                      <span style={{ color: '#22c55e' }}>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <FaExclamationCircle style={{ color: '#ef4444', marginRight: '8px' }} />
                      <span style={{ color: '#ef4444' }}>Passwords don't match</span>
                    </>
                  )}
                </motion.div>
              )}
              
              <motion.button 
                type="button"
                style={backButtonStyle}
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button 
          type="submit" 
          style={loading === 'success' ? successButtonStyle : buttonStyle}
          disabled={loading === true}
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
          {loading === true ? 'Creating Account...' : 
           loading === 'success' ? 'Success!' : 
           formStage === 0 ? 'Continue' : 'Create Account'}
        </motion.button>
        
        <motion.p 
          style={footerTextStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Already have an account? <span style={footerLinkStyle}>Sign In</span>
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
  background: '#1f2937',
  padding: '40px',
  borderRadius: '10px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
};

const headerStyle = {
  color: '#ffffff',
  textAlign: 'center',
  marginBottom: '10px',
  position: 'relative',
};

const underlineStyle = {
  height: '2px',
  background: '#6366F1',
  position: 'absolute',
  bottom: '-5px',
  left: '50%',
  transform: 'translateX(-50%)',
};

const subtitleStyle = {
  color: '#9CA3AF',
  textAlign: 'center',
  marginBottom: '30px',
};

const errorContainerStyle = {
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  padding: '10px',
  borderRadius: '5px',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '20px',
};

const inputContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  background: '#111827',
  padding: '10px 15px',
  borderRadius: '5px',
  border: '1px solid #444',
  transition: 'border-color 0.3s',
};

const iconStyle = {
  marginRight: '10px',
  fontSize: '18px',
};

const inputStyle = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#ffffff',
  width: '100%',
};

const strengthContainerStyle = {
  marginTop: '10px',
};

const strengthLabelStyle = {
  color: '#9CA3AF',
  fontSize: '14px',
  marginBottom: '5px',
};

const strengthBarContainerStyle = {
  background: '#374151',
  borderRadius: '5px',
  overflow: 'hidden',
  height: '8px',
};

const strengthBarStyle = {
  height: '100%',
  transition: 'width 0.5s',
};

const strengthChecksStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '5px',
  color: '#9CA3AF',
  fontSize: '12px',
};

const matchIndicatorStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid',
  marginTop: '10px',
};

const backButtonStyle = {
  background: 'transparent',
  border: '1px solid #6366F1',
  color: '#6366F1',
  padding: '10px 20px',
  borderRadius: '5px',
  marginTop: '20px',
  cursor: 'pointer',
  transition: 'all 0.3s',
};

const buttonStyle = {
  background: '#6366F1',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '5px',
  border: 'none',
  cursor: 'pointer',
  marginTop: '20px',
  width: '100%',
  transition: 'all 0.3s',
};

const successButtonStyle = {
  background: '#22c55e',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '5px',
  border: 'none',
  cursor: 'pointer',
  marginTop: '20px',
  width: '100%',
  transition: 'all 0.3s',
};

const spinnerStyle = {
  border: '2px solid #ffffff',
  borderTop: '2px solid transparent',
  borderRadius: '50%',
  width: '16px',
  height: '16px',
  animation: 'spin 1s linear infinite',
  marginRight: '10px',
};

const checkmarkContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const footerTextStyle = {
  color: '#9CA3AF',
  textAlign: 'center',
  marginTop: '20px',
};

const footerLinkStyle = {
  color: '#6366F1',
  cursor: 'pointer',
};

export default SignUp;