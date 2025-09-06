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
    name: z.string(),
    phone: z
      .string()
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 10, {
        message: "phone number must be 10 digits",
      }),
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
    pieceDetails: [],
    timeline: getTwoMonthsFromNow(),
    inspiration: "",
    specialConsiderations: "",
    consent: false,
  };
};
