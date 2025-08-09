import { z } from "zod";

export interface AuthPanelProps {
  redirectTo?: string;
  onOpenChange?: (open: boolean) => void;
}

export const getValidationMessages = (t: (key: string) => string) => ({
  email: {
    required: t("validation.email.required"),
    invalid: t("validation.email.invalid"),
  },
});

export const createSchemas = (t: (key: string) => string) => {
  const messages = getValidationMessages(t);

  const emailSchema = z.string().min(1, messages.email.required).email(messages.email.invalid);

  return {
    emailSchema,
  };
};
