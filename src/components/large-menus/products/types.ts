export interface ProductMenuItem {
  title: string;
  description?: string;
  href: string;
  icon?: React.ReactNode;
  imageUrl?: string;
}

export interface ProductCategory {
  label: string;
  items: ProductMenuItem[];
}
export type LocaleData = {
  [key: string]: ProductCategory[];
};
