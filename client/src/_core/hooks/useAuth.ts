import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(async () => {
    utils.auth.me.setData(undefined, null);
    window.location.href = "/api/auth/logout";
  }, [utils]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;
    const isRealUser = Boolean(user && user.loginMethod !== "guest");
    return {
      user: isRealUser ? user : null,
      loading: meQuery.isLoading,
      error: meQuery.error ?? null,
      isAuthenticated: isRealUser,
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
