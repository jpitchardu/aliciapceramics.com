import { pieceOrderDetailSchema } from "@/models/Piece";
import z from "zod";

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
    timeline: z.date().min(new Date(), "timeline must be in the future"),
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
    timeline: new Date(),
    inspiration: "",
    specialConsiderations: "",
    consent: false,
  };
};
