import FooterLinks from "./links";
import FooterLogo from "./logo";

const Footer = () => {
  return (
    <footer className="mt-auto bg-[hsl(var(--footer-bg))] py-8 text-[hsl(var(--footer-text))] select-none sm:py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <FooterLinks />

          <div className="hidden md:col-span-1 md:block">
            <div className="mx-auto h-full w-px bg-[hsl(var(--footer-divider))]"></div>
          </div>

          <FooterLogo />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
