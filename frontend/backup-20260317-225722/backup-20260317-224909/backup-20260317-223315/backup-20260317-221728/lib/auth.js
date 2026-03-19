// Simple auth implementation for now
export function AuthProvider({ children }) {
  return <>{children}</>;
}

export function useAuth() {
  return {
    user: null,
    loading: false,
    login: () => Promise.resolve(),
    logout: () => {},
    isAuthenticated: false,
  };
}
