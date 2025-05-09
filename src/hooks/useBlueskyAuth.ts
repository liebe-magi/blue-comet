/**
 * React Hook for managing Bluesky authentication
 */
import { useCallback, useState } from 'react';
import { blueskyAgent } from '../api/agent';
import { BlueskyAuthCredentials, BlueskyAuthState } from '../types';

/**
 * Custom hook for managing Bluesky authentication state
 * @returns Authentication related states and functions
 */
export const useBlueskyAuth = () => {
  // State to manage authentication status
  const [authState, setAuthState] = useState<BlueskyAuthState>({
    isAuthenticated: false,
    loading: false,
  });

  /**
   * Login to Bluesky
   * @param credentials Login information
   */
  const login = useCallback(async (credentials: BlueskyAuthCredentials) => {
    setAuthState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const result = await blueskyAgent.login(credentials);

      if (result.success) {
        setAuthState({
          isAuthenticated: true,
          did: result.did,
          handle: result.handle,
          loading: false,
        });
        return true;
      } else {
        setAuthState({
          isAuthenticated: false,
          error: result.error || 'Authentication failed',
          loading: false,
        });
        return false;
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'An error occurred during authentication',
        loading: false,
      });
      return false;
    }
  }, []);

  /**
   * Logout from Bluesky
   */
  const logout = useCallback(() => {
    blueskyAgent.logout();
    setAuthState({
      isAuthenticated: false,
      loading: false,
    });
  }, []);

  /**
   * Check authentication status
   */
  const checkSession = useCallback(() => {
    const isValid = blueskyAgent.isSessionValid();
    if (!isValid && authState.isAuthenticated) {
      setAuthState({
        isAuthenticated: false,
        loading: false,
      });
    }
    return isValid;
  }, [authState.isAuthenticated]);

  return {
    authState,
    login,
    logout,
    checkSession,
  };
};
