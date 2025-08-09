import Nodemailer from "next-auth/providers/nodemailer";
import Resend from "next-auth/providers/resend";
export const resendProvider = process.env.RESEND_API_KEY
  ? Resend({ apiKey: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM })
  : null;

export const nodemailerProvider =
  process.env.EMAIL_SERVER && process.env.EMAIL_FROM
    ? Nodemailer({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
      })
    : null;
