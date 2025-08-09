"use client";
import Clarity from "@microsoft/clarity";
import { useEffect } from "react";

export default function MicrosoftClarity() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CLARITY_ID) {
      Clarity.init(process.env.NEXT_PUBLIC_CLARITY_ID);
    }
  }, []);
  return null;
}
