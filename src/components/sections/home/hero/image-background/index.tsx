"use client";

import Image from "next/image";

export const Background = () => {
  return (
    <div className="relative h-full w-full">
      <div className="relative h-full w-full">
        <Image
          src="/images/home/hero/bg-light-blur.svg"
          alt="Hero background light"
          fill
          priority
          className="object-cover opacity-100 transition-opacity duration-1000 dark:opacity-0"
        />
        <Image
          src="/images/home/hero/bg-dark-blur.svg"
          alt="Hero background dark"
          fill
          priority
          className="object-cover opacity-0 transition-opacity duration-1000 dark:opacity-100"
        />
      </div>
      <div className="absolute inset-0 bg-[var(--hero-overlay-light)] backdrop-blur-xs transition-all duration-1000 dark:bg-[var(--hero-overlay-dark)]" />
    </div>
  );
};
