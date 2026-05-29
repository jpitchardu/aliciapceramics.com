import { pieceOrderDetailSchema } from "@/models/Piece";
import z from "zod";

export function getTwoMonthsFromNow() {
  const now = new Date();
  now.setMonth(now.getMonth() + 2);
  return now;
}
export function getTwoMonthsFromNowInMinFormat() {
  const date = getTwoMonthsFromNow();

  return date.toISOString().split("T")[0];
}

export const orderClientSchema = z
  .object({
    email: z.email(),
    name: z.string().min(1, "name is required"),
    phone: z
      .string()
      .min(10, "phone number too short")
      .transform((val) => val.replace(/\D/g, ""))
      .refine((v) => v.length === 10, {
        message: "phone number must be exactly 10 digits",
      })
      .refine((v) => !v.startsWith("0") && !v.startsWith("1"), {
        message: "phone number must be a valid US number",
      })
      .transform((v) => `+1${v}`),
    communicationPreferences: z.enum(["sms", "email_only"]).optional(),
  })
  .strict();

export const orderSchema = z
  .object({
    client: orderClientSchema,
    pieceDetails: z
      .array(pieceOrderDetailSchema)
      .min(1, "at least one piece is required"),
    timeline: z
      .date()
      .min(
        getTwoMonthsFromNow(),
        "timeline must be at least 2 months from now",
      ),
    inspiration: z.string().optional(),
    specialConsiderations: z.string().optional(),
    consent: z.boolean(),
  })
  .strict();

export type Order = z.infer<typeof orderSchema>;

export const getEmptyOrder = (): Order => {
  return {
    client: {
      email: "",
      name: "",
      phone: "",
    },
    inspiration: "",
    specialConsiderations: "",
    timeline: undefined,
    pieceDetails: [],
    consent: false,
  } as unknown as Order;
};
