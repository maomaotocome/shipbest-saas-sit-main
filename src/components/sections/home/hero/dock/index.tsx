"use client";

import UnifiedInvoker from "@/components/toolpanel/UnifiedInvoker";
import { ModelCategory, TaskType } from "@/lib/constants";
import { FaCode, FaEnvelope, FaHome, FaUserAlt } from "react-icons/fa";
import { DockItem } from "./item";

export const Dock = () => {
  const items = [
    {
      icon: FaHome,
      label: "Home",
      component: (
        <UnifiedInvoker
          taskType={TaskType.ModelDirectInvocation}
          metadata={{ model_category: ModelCategory.TextToImage }}
          demoType="image"
          demoInterval={5000}
          containerHeight="h-180"
        />
      ),
    },
    {
      icon: FaUserAlt,
      label: "About",
      component: (
        <UnifiedInvoker
          taskType={TaskType.ModelDirectInvocation}
          metadata={{ model_category: ModelCategory.ImageToImage }}
          demoType="image"
          demoInterval={5000}
          containerHeight="h-180"
        />
      ),
    },
    {
      icon: FaCode,
      label: "Projects",
      component: (
        <UnifiedInvoker
          taskType={TaskType.ModelDirectInvocation}
          metadata={{ model_category: ModelCategory.TextToVideo }}
          demoType="video"
          demoInterval={5000}
          containerHeight="h-180"
        />
      ),
    },
    {
      icon: FaEnvelope,
      label: "Contact",
      component: (
        <UnifiedInvoker
          taskType={TaskType.ModelDirectInvocation}
          metadata={{ model_category: ModelCategory.ImageToVideo }}
          demoType="video"
          demoInterval={5000}
          containerHeight="h-180"
        />
      ),
    },
  ];

  return (
    <div className="flex gap-6 rounded-xl bg-white/[0.02] p-5 shadow-lg backdrop-blur-xl sm:gap-4 sm:rounded-2xl sm:p-3 md:gap-6 md:p-4">
      {items.map((item, index) => (
        <DockItem key={index} {...item} />
      ))}
    </div>
  );
};
