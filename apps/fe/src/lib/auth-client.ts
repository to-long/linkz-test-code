import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: window.location.origin,
});

export const { useSession, signIn, signUp, signOut: _signOut } = authClient;

export async function handleSignOut() {
  await _signOut({
    fetchOptions: {
      credentials: "include",
    },
  });
}

export const signOut = handleSignOut;

export function signInWithGoogle() {
  return signIn.social({
    provider: "google",
    callbackURL: window.location.origin,
  });
}
