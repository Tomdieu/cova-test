import { use, createContext, useCallback, useEffect, useState, type PropsWithChildren } from "react";
import { auth as authApi, setTokens, clearTokens, getToken } from "@/api/client";
import type { User } from "@/types";
import { useStorageState } from "./use-storage-state";

interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [, setSession] = useStorageState("session");
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const token = await getToken();
      if (cancelled) return;
      if (!token) {
        setIsReady(true);
        return;
      }
      try {
        const profile = await authApi.profile();
        if (!cancelled) setUser(profile);
      } catch {
        await clearTokens();
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [setSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      await setTokens(res.access, res.refresh);
      setSession("authenticated");
      setUser(res.user);
    },
    [setSession],
  );

  const signUp = useCallback(
    async (data: {
      username: string;
      email: string;
      password: string;
      first_name?: string;
      last_name?: string;
    }) => {
      await authApi.register(data);
      const res = await authApi.login({ email: data.email, password: data.password });
      await setTokens(res.access, res.refresh);
      setSession("authenticated");
      setUser(res.user);
    },
    [setSession],
  );

  const signOut = useCallback(async () => {
    await clearTokens();
    setSession(null);
    setUser(null);
  }, [setSession]);

  const isLoading = !isReady;

  return (
    <SessionContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const value = use(SessionContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }
  return value;
}
