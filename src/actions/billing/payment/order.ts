"use server";

import { type Locale } from "@/i18n/locales";
import { getUser } from "@/lib/auth/utils";
import { getClientCountry, getIp } from "@/lib/ip-addr";
import { order } from "@/services/billing/payment/order";
import { type JsonObject } from "@/types/json";
import { getLocale } from "next-intl/server";
export async function createOrder(data: {
  planId: string;
  periodId: string;
  utmData?: JsonObject;
}) {
  try {
    const { planId, periodId, utmData } = data;
    const user = await getUser();
    const locale = (await getLocale()) as Locale;

    if (!user || !user.id || !user.email) {
      throw new Error("Unauthorized");
    }

    const orderResult = await order({
      userId: user.id,
      email: user.email,
      planId,
      periodId,
      locale,
      ipAddress: await getIp(),
      countryCode: (await getClientCountry()) || "",
      utmData,
    });

    return {
      result: "success",
      data: orderResult,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order");
  }
}
