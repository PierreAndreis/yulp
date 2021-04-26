import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import * as api from './api';

import create from 'zustand';
import queryClient from './queryClient';
import { useHistory } from 'react-router';

export const useTokenStorage = create<{ token: string | null; setToken: (token: string | null) => void }>((set) => ({
  token: localStorage.getItem('__TOKEN__'),
  setToken: (token) => {
    localStorage.setItem('__TOKEN__', token || '');

    queryClient.invalidateQueries();
    set({ token });
  },
}));

type AuthContextValue = {
  user: null | any;
  isLoggedIn: boolean;
  isLoading: boolean;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  logout: () => {
    throw new Error('AuthContext not initialized');
  },
});

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const token = useTokenStorage((state) => state.token);
  const setToken = useTokenStorage((state) => state.setToken);

  const history = useHistory();
  const { data, status } = useQuery('me', () => api.me(), {
    enabled: Boolean(token),
  });

  const [isInitialized, setInitialized] = useState(false);

  useEffect(() => {
    if (token && status === 'success') {
      setInitialized(true);
      return;
    }

    setInitialized(true);
  }, [status, setInitialized]);

  const logout = useCallback(() => {
    setToken(null);
    queryClient.invalidateQueries();
    history.push('/');
  }, [setToken, history]);

  const isLoggedIn = token ? Boolean(data?.user) : false;

  const value = useMemo(
    () => ({ user: data?.user, isLoggedIn, isInitialized, logout, isLoading: status === 'loading' }),
    [data?.user, isLoggedIn, status, logout],
  );

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
};

export function useAuth() {
  return useContext(AuthContext);
}
