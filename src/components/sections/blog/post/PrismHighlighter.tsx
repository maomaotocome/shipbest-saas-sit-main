"use client";

import { useTheme } from "next-themes";
import Prism from "prismjs";
import { useEffect } from "react";

// Import basic Prism CSS and a theme
import "prismjs/themes/prism-tomorrow.css"; // Dark theme
import "prismjs/themes/prism.css"; // Light theme
// Import additional plugins for better highlighting
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/normalize-whitespace/prism-normalize-whitespace";
// Import languages
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";

interface PrismHighlighterProps {
  children: React.ReactNode;
}

export default function PrismHighlighter({ children }: PrismHighlighterProps) {
  const { resolvedTheme } = useTheme();

  // Apply Prism highlighting on the client side
  useEffect(() => {
    // Initialize Prism with plugins
    if (typeof window !== "undefined") {
      Prism.manual = true;

      // Configure plugins
      const prismPlugins = Prism.plugins as {
        NormalizeWhitespace: {
          setDefaults: (options: Record<string, boolean>) => void;
        };
      };

      prismPlugins.NormalizeWhitespace.setDefaults({
        "remove-trailing": true,
        "remove-indent": true,
        "left-trim": true,
        "right-trim": true,
      });

      // Apply theme class based on current theme
      if (resolvedTheme === "dark") {
        document.documentElement.classList.add("prism-dark-theme");
      } else {
        document.documentElement.classList.remove("prism-dark-theme");
      }

      // Highlight all code blocks without modifying the DOM structure
      const codeBlocks = document.querySelectorAll("pre code");
      if (codeBlocks.length > 0) {
        // Use a small timeout to ensure React has finished hydration
        setTimeout(() => {
          codeBlocks.forEach((block) => {
            Prism.highlightElement(block);
          });
        }, 0);
      }
    }
  }, [resolvedTheme]);

  return <>{children}</>;
}
