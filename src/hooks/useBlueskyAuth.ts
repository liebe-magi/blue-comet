/**
 * Blueskyの認証を管理するReact Hook
 */
import { useCallback, useState } from 'react';
import { blueskyAgent } from '../api/agent';
import { BlueskyAuthCredentials, BlueskyAuthState } from '../types';

/**
 * Blueskyの認証状態を管理するカスタムフック
 * @returns 認証関連の状態と関数
 */
export const useBlueskyAuth = () => {
  // 認証状態を管理するステート
  const [authState, setAuthState] = useState<BlueskyAuthState>({
    isAuthenticated: false,
    loading: false,
  });

  /**
   * Blueskyにログインする
   * @param credentials ログイン情報
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
          error: result.error || '認証に失敗しました',
          loading: false,
        });
        return false;
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        error: error instanceof Error ? error.message : '認証中にエラーが発生しました',
        loading: false,
      });
      return false;
    }
  }, []);

  /**
   * ログアウトする
   */
  const logout = useCallback(() => {
    blueskyAgent.logout();
    setAuthState({
      isAuthenticated: false,
      loading: false,
    });
  }, []);

  /**
   * 認証状態を確認する
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
