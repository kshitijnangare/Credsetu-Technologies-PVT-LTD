import { useAuthStore } from "../store/authStore";

export { useAuthStore };

export const useAuth = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const booting = useAuthStore((state) => state.booting);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return {
    token,
    user,
    booting,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };
};