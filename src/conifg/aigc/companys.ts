export enum Company {
  stability = "Stability AI",
  blackForestLabs = "Black Forest Labs",
  openai = "OpenAI",
  bytedance = "ByteDance",
  google = "Google",
  kwai = "Kwai",
  minimax = "Minimax",
  suno = "Suno Inc",
}
export interface CompanyItem {
  icon: string;
  name: string;
  order: number;
}

export const companys: Record<Company, CompanyItem> = {
  [Company.stability]: {
    icon: "/images/aigc/models/logo/stability.svg",
    name: "Stability AI",
    order: 1,
  },
  [Company.blackForestLabs]: {
    icon: "/images/aigc/models/logo/black-forest-labs.svg",
    name: "Black Forest Labs",
    order: 2,
  },
  [Company.openai]: {
    icon: "/images/aigc/models/logo/openai.svg",
    name: "OpenAI",
    order: 3,
  },
  [Company.bytedance]: {
    icon: "/images/aigc/models/logo/bytedance.svg",
    name: "ByteDance",
    order: 4,
  },
  [Company.google]: {
    icon: "/images/aigc/models/logo/google.svg",
    name: "Google",
    order: 5,
  },
  [Company.kwai]: {
    icon: "/images/aigc/models/logo/kwai.svg",
    name: "Kwai",
    order: 6,
  },
  [Company.minimax]: {
    icon: "/images/aigc/models/logo/minimax.svg",
    name: "Minimax",
    order: 7,
  },
  [Company.suno]: {
    icon: "/images/aigc/models/logo/suno.svg",
    name: "Suno Inc",
    order: 8,
  },
};
