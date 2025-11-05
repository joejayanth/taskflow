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
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 rounded-lg border p-8 shadow-sm">
        <div className="flex items-center gap-2">
            <CircleCheck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">TaskFlow</h1>
        </div>
        <p className="text-muted-foreground">Sign in to manage your tasks.</p>
        <Button onClick={handleSignIn} className="w-full">
          Sign In with Google
        </Button>
      </div>
    </div>
  );
}
