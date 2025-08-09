"use client";

import Adsense from "@/components/common/ad/google-adsense";
import ClarityAnalytics from "@/components/common/analytics/clarity";
import GoogleAnalytics from "@/components/common/analytics/google-analytics";
import Announcement from "@/components/common/announcement";
import Footer from "@/components/common/footer";
// import Header from "@/components/common/header/full-width";
import Header from "@/components/common/header/float";
import { SystemNotificationToast } from "@/components/common/notifications/SystemNotificationToast";
import { useState } from "react";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  return (
    <>
      <SystemNotificationToast />

      <div className="flex min-h-screen flex-col">
        <div className="fixed top-0 right-0 left-0 z-50">
          {showAnnouncement && (
            <Announcement
              message="Welcome to our new platform! 🎉"
              onClose={() => setShowAnnouncement(false)}
            />
          )}
        </div>
        <Header topOffset={showAnnouncement ? 40 : 0} />
        {showAnnouncement && <div className="h-[40px]" />}
        <main className="grow">{children}</main>
        <Footer />
      </div>
      <GoogleAnalytics />
      <ClarityAnalytics />
      <Adsense />
    </>
  );
}
