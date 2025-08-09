"use client";
import { ProviderId } from "@/lib/auth/providers/enum";
import { CredentialResponse } from "google-one-tap";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useOneTapSignin = () => {
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPromptShowing, setIsPromptShowing] = useState(false);

  useEffect(() => {
    // Only proceed if session status is not loading
    if (status === "loading") {
      console.log("Google One Tap: Session loading, skipping...");
      return;
    }

    // Skip if user is already signed in
    if (session) {
      console.log("Google One Tap: User signed in, skipping...");
      return;
    }

    console.log("Google One Tap: Attempting to initialize...", {
      isInitialized,
      isPromptShowing,
      googleAvailable: !!window.google?.accounts?.id,
      clientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    // Check prerequisites
    if (!window.google?.accounts?.id || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.log("Google One Tap: Prerequisites not met", {
        googleAvailable: !!window.google?.accounts?.id,
        clientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });
      return;
    }

    // Initialize if not already done
    if (!isInitialized) {
      console.log("Google One Tap: Initializing...");

      const handleCredentialResponse = async (response: CredentialResponse) => {
        console.log("Google One Tap: Credential response received");
        try {
          await signIn(ProviderId.GOOGLE_ONE_TAP, {
            credential: response.credential,
            redirect: false,
          });
        } catch (error) {
          console.error("Error during Google One Tap sign in:", error);
        } finally {
          setIsPromptShowing(false);
        }
      };

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: true,
        cancel_on_tap_outside: false,
      });

      setIsInitialized(true);
      console.log("Google One Tap: Initialization complete");
    }

    // Show prompt if not already showing
    if (isInitialized && !isPromptShowing) {
      console.log("Google One Tap: Showing prompt");
      setIsPromptShowing(true);
      window.google.accounts.id.prompt();
    }
  }, [session, status, isInitialized, isPromptShowing]);
};
