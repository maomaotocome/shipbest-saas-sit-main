"use client";

import { AuthDialog } from "@/components/common/auth/dialog";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AuthenticatedMenu } from "./AuthenticatedMenu";
import { UnauthenticatedMenu } from "./UnauthenticatedMenu";

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 500);
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex h-9 w-9 items-center justify-center rounded-lg p-2 ${
          isOpen
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
        aria-label="User menu"
      >
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt="User avatar"
            className="h-5 w-5 rounded-full"
            width={20}
            height={20}
          />
        ) : (
          <User className="h-5 w-5" />
        )}
      </button>

      {isOpen &&
        (session?.user ? (
          <AuthenticatedMenu session={session} onClose={() => setIsOpen(false)} />
        ) : (
          <UnauthenticatedMenu
            onClose={() => setIsOpen(false)}
            onAuthClick={() => {
              setIsOpen(false);
              setIsAuthDialogOpen(true);
            }}
          />
        ))}

      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </div>
  );
};
