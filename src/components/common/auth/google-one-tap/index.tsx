"use client";
import Script from "next/script";
import { useOneTapSignin } from "./hooks";
export const GoogleOneTap = () => {
  useOneTapSignin();
  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
    </>
  );
};
