/**
 * UTM Utilities
 *
 * Utility functions for working with UTM tracking data stored in localStorage
 */

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  via?: string;
}

interface UtmTrackingData extends UtmParams {
  timestamp: string;
  expiry: string;
}

const UTM_STORAGE_KEY = "utm_tracking_data";

/**
 * Get UTM tracking data from localStorage
 * @returns UTM parameters object or null if no data or expired
 */
export function getUtmData(): UtmParams | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return null;

    const data: UtmTrackingData = JSON.parse(stored);
    const now = new Date();
    const expiryDate = new Date(data.expiry);

    // Check if data has expired
    if (now > expiryDate) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      return null;
    }

    // Return data without internal fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timestamp, expiry, ...utmData } = data;
    return utmData;
  } catch (error) {
    console.error("Error reading UTM data:", error);
    return null;
  }
}

/**
 * Clear UTM tracking data from localStorage
 */
export function clearUtmData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(UTM_STORAGE_KEY);
  }
}

/**
 * Check if UTM data exists and is not expired
 */
export function hasUtmData(): boolean {
  return getUtmData() !== null;
}

/**
 * Get specific UTM parameter value
 * @param param - UTM parameter name
 * @returns Parameter value or null
 */
export function getUtmParam(param: keyof UtmParams): string | null {
  const data = getUtmData();
  return data?.[param] || null;
}

/**
 * Get UTM attribution string for analytics
 * @returns Formatted attribution string
 */
export function getUtmAttribution(): string | null {
  const data = getUtmData();
  if (!data) return null;

  const parts: string[] = [];
  if (data.utm_source) parts.push(`source=${data.utm_source}`);
  if (data.utm_medium) parts.push(`medium=${data.utm_medium}`);
  if (data.utm_campaign) parts.push(`campaign=${data.utm_campaign}`);
  if (data.utm_term) parts.push(`term=${data.utm_term}`);
  if (data.utm_content) parts.push(`content=${data.utm_content}`);
  if (data.via) parts.push(`via=${data.via}`);

  return parts.length > 0 ? parts.join(" | ") : null;
}

/**
 * Get UTM data as query string parameters
 * @returns URL query string or empty string
 */
export function getUtmQueryString(): string {
  const data = getUtmData();
  if (!data) return "";

  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value && key !== "timestamp") {
      params.set(key, value);
    }
  });

  return params.toString();
}

/**
 * Get UTM data for form submissions or API calls
 * @returns UTM data object with only defined values
 */
export function getUtmDataForSubmission(): Record<string, string> {
  const data = getUtmData();
  if (!data) return {};

  const result: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value && key !== "timestamp") {
      result[key] = value;
    }
  });

  return result;
}
