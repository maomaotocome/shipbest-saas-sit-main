import { RecreateTaskProvider } from "@/components/common/ai/RecreateTaskProvider";
import { ReactNode } from "react";

interface ExploreLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function ExploreLayout({ children, modal }: ExploreLayoutProps) {
  return (
    <RecreateTaskProvider>
      {children}
      {modal}
    </RecreateTaskProvider>
  );
}
