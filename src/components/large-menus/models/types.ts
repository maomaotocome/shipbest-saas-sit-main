export interface ModelMenuItem {
  title: string;
  description?: string;
  href: string;
  icon?: React.ReactNode;
  imageUrl?: string;
}

export interface ModelCategory {
  label: string;
  items: ModelMenuItem[];
}
export type LocaleData = {
  [key: string]: ModelCategory[];
};
