import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";
const FooterLogo = () => {
  const socialLinks = [
    {
      platform: "twitter",
      id: process.env.NEXT_PUBLIC_TWITTER_ID,
      icon: FaTwitter,
      url: `https://twitter.com/${process.env.NEXT_PUBLIC_TWITTER_ID}`,
    },
    {
      platform: "facebook",
      id: process.env.NEXT_PUBLIC_FACEBOOK_ID,
      icon: FaFacebook,
      url: `https://facebook.com/${process.env.NEXT_PUBLIC_FACEBOOK_ID}`,
    },
    {
      platform: "instagram",
      id: process.env.NEXT_PUBLIC_INSTAGRAM_ID,
      icon: FaInstagram,
      url: `https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_ID}`,
    },
    {
      platform: "linkedin",
      id: process.env.NEXT_PUBLIC_LINKEDIN_ID,
      icon: FaLinkedin,
      url: `https://linkedin.com/company/${process.env.NEXT_PUBLIC_LINKEDIN_ID}`,
    },
    {
      platform: "youtube",
      id: process.env.NEXT_PUBLIC_YOUTUBE_ID,
      icon: FaYoutube,
      url: `https://youtube.com/${process.env.NEXT_PUBLIC_YOUTUBE_ID}`,
    },
  ];

  return (
    <div className="flex h-full min-h-48 flex-col text-center md:col-span-3 md:text-right">
      <div>
        <div className="mb-1 flex items-center justify-center md:justify-end">
          <Image
            src="/images/company-logo-dark.svg"
            className="hidden dark:block"
            alt={process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Company Logo"}
            width={120}
            height={40}
          />
          <Image
            src="/images/company-logo-light.svg"
            className="block dark:hidden"
            alt={process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Company Logo"}
            width={120}
            height={40}
          />
        </div>
        <div className="mb-2 text-xs font-light text-[hsl(var(--footer-text-muted))] md:mb-2">
          <p className="flex items-center justify-center md:justify-end">
            {process.env.NEXT_PUBLIC_COMPANY_NAME}
          </p>
        </div>
        <div className="mb-6 flex justify-center space-x-4 text-[hsl(var(--footer-text))] md:mb-0 md:justify-end hover:[&>a]:text-[hsl(var(--footer-social-hover))]">
          {socialLinks.map(
            (social) =>
              social.id && (
                <Link
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  className="hover:opacity-80"
                >
                  <social.icon size={24} />
                </Link>
              )
          )}
        </div>
      </div>
      <div className="mt-6 text-center text-xs font-light text-[hsl(var(--footer-text-muted))] md:mt-auto md:text-right">
        <p className="uppercase">
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_COMPANY_SHORT_NAME}. All rights
          reserved.
        </p>
      </div>
    </div>
  );
};

export default FooterLogo;
