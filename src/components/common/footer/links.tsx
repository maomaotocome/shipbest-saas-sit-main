import { useFooterLinks } from "@/staticData/footer-links";
import Link from "next/link";

const FooterLinks = () => {
  const footerSections = useFooterLinks();

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-8 md:grid-cols-3">
      {footerSections.map((section, index) => (
        <div key={index}>
          <h2 className="mb-4 text-lg font-semibold text-[hsl(var(--footer-text))]">
            {section.title}
          </h2>
          <ul className="space-y-2 text-sm font-normal text-[hsl(var(--footer-text-muted))]">
            {section.links.map((link, linkIndex) => (
              <li key={linkIndex} className="hover:text-[hsl(var(--footer-text-hover))]">
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default FooterLinks;
