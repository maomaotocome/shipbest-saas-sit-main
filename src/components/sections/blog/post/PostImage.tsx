"use client";
import Image from "next/image";

interface Props {
  imageUrl: string;
  title: string;
}

export function PostImage({ imageUrl, title }: Props) {
  return (
    <div className="fixed inset-0 w-full h-100vh -z-10">
      <Image
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
        fill
        priority
      />
      <div className="absolute inset-0 bg-linear-to-br from-transparent via-white/50 to-white dark:via-black/80 dark:to-black" />
    </div>
  );
} 