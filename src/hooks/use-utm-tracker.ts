import type { UtmParams } from "@/lib/utm-utils";
import { useIsomorphicLayoutEffect, useLocalStorage } from "usehooks-ts";
// Import FingerprintJS to generate browser fingerprint
import FingerprintJS, { type Agent, type GetResult } from "@fingerprintjs/fingerprintjs";

interface UtmTrackingData extends UtmParams {
  timestamp: string;
  expiry: string;
  /** FingerprintJS visitor id */
  fingerprint?: string;
}

const UTM_STORAGE_KEY = "utm_tracking_data";
const UTM_EXPIRY_DAYS = 14;

export function useUtmTracker() {
  const [utmData, setUtmData] = useLocalStorage<UtmTrackingData | null>(UTM_STORAGE_KEY, null);

  useIsomorphicLayoutEffect(() => {
    // Check if existing data has expired
    if (utmData) {
      const now = new Date();
      const expiryDate = new Date(utmData.expiry);

      if (now > expiryDate) {
        setUtmData(null);
        return;
      }
    }

    // Extract UTM parameters from current URL
    const urlParams = new URLSearchParams(window.location.search);
    const newUtmParams: UtmParams = {};

    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "via"];
    let hasNewUtmParams = false;

    utmKeys.forEach((key) => {
      const value = urlParams.get(key);
      if (value) {
        newUtmParams[key as keyof UtmParams] = value;
        hasNewUtmParams = true;
      }
    });
    // browser fingerprint
    // Only update if there are new UTM parameters
    if (hasNewUtmParams) {
      const expiryTime = new Date();
      expiryTime.setDate(expiryTime.getDate() + UTM_EXPIRY_DAYS);

      // Generate browser fingerprint asynchronously
      FingerprintJS.load()
        .then((fp: Agent) => fp.get())
        .then((result: GetResult) => {
          const trackingData: UtmTrackingData = {
            ...newUtmParams,
            timestamp: new Date().toISOString(),
            expiry: expiryTime.toISOString(),
            fingerprint: result.visitorId,
          };

          setUtmData(trackingData);
        })
        .catch(() => {
          // Fallback in case fingerprint generation fails
          const trackingData: UtmTrackingData = {
            ...newUtmParams,
            timestamp: new Date().toISOString(),
            expiry: expiryTime.toISOString(),
          };

          setUtmData(trackingData);
        });
    }
  }, []);

  // Function to get current valid UTM data
  const getUtmData = (): UtmTrackingData | null => {
    if (!utmData) return null;

    const now = new Date();
    const expiryDate = new Date(utmData.expiry);

    if (now > expiryDate) {
      setUtmData(null);
      return null;
    }

    // Return data without internal fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timestamp, expiry, ...cleanUtmData } = utmData;
    return cleanUtmData as UtmTrackingData;
  };

  // Function to clear UTM data
  const clearUtmData = () => {
    setUtmData(null);
  };

  // Function to check if data exists and is valid
  const hasValidUtmData = (): boolean => {
    return getUtmData() !== null;
  };
  return {
    getUtmData,
    clearUtmData,
    hasValidUtmData,
    rawData: utmData,
  };
}
