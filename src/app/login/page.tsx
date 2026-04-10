"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAuth,
  useUser,
  useFirestore,
  setDocumentNonBlocking,
} from "@/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
} from "firebase/auth";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await upsertUserProfile(result.user);
      router.push("/");
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  const upsertUserProfile = async (firebaseUser: FirebaseUser) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", firebaseUser.uid);
    const userData = {
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
    };
    setDocumentNonBlocking(userRef, userData, { merge: true });
  };

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary animate-pulse">
          <CircleCheck className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-violet-400/5 blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative z-10 flex flex-col items-center gap-6 rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm p-10 shadow-xl w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <CircleCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">TaskFlow</h1>
            <p className="text-sm text-muted-foreground mt-1">Your personal task command center</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border/60" />

        {/* Sign in */}
        <div className="w-full space-y-3">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-medium">
            Sign in to continue
          </p>
          <Button
            onClick={handleSignIn}
            className="w-full gap-2 h-11 text-sm font-semibold shadow-sm"
          >
            {/* Google G icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="currentColor"
                opacity="0.9"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 leading-relaxed">
          Your tasks are securely stored and private to your account.
        </p>
      </div>
    </div>
  );
}
