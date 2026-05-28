import { useUser, useClerk, useAuth } from "@clerk/clerk-react";

/**
 * Clerk auth hooks wrapper.
 * Provides a consistent API shape so existing components work seamlessly.
 */
export function useSession() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();

  return {
    data: isSignedIn && user
      ? {
          user: {
            id: user.id,
            name: user.fullName || user.firstName || "User",
            email: user.primaryEmailAddress?.emailAddress || "",
            image: user.imageUrl || null,
          },
        }
      : null,
    isPending: !isLoaded,
  };
}

export function useSignOut() {
  const { signOut: clerkSignOut } = useClerk();
  return () => clerkSignOut();
}

// Re-export for components that call signOut directly
export async function signOut() {
  // This is a fallback — components should prefer useSignOut() hook
  // But window.Clerk is available after ClerkProvider mounts
  if (window.Clerk) {
    await window.Clerk.signOut();
  }
}
