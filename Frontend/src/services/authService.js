import api from './api';

export const authService = {
  async signup(username, email, password) {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async signin(usernameOrEmail, password) {
    try {
      const response = await api.post('/auth/login', {
        usernameOrEmail,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid credentials');
    }
  },

  async googleSignIn(credential) {
    try {
      // Changed from /auth/google to match your server.js route mapping
      const response = await api.post('/google-signin', { credential });
      return response.data;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw new Error(error.response?.data?.message || 'Google sign in failed');
    }
  },

  async completeGoogleOnboarding(credential, username, password) {
    try {
      const response = await api.post('/auth/google-onboarding', {
        credential,
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Google onboarding failed');
    }
  },

  logout() {
    // Clear any stored tokens or user data
    localStorage.removeItem('token');
  },
};