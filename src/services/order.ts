import { Order } from "@/models/Order";

type SuccessApiResponse = { success: true };
type ErrorApiResponse = { success: false; error: ErrorCode };

export type ApiResponse = SuccessApiResponse | ErrorApiResponse;

export type ErrorCode =
  | "TOO_MANY_REQUESTS"
  | "SERVER_ERROR"
  | "CLIENT_ERROR"
  | "UNKNOWN";

const statusToErrorCodeMap: Record<number, ErrorCode> = {
  429: "TOO_MANY_REQUESTS",
  400: "CLIENT_ERROR",
  500: "SERVER_ERROR",
};

export async function createOrder(order: Order): Promise<ApiResponse> {
  const res = await fetch("/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order: { ...order, timeline: order.timeline.toISOString().slice(0, 10) },
    }),
  });

  return res.ok
    ? { success: true }
    : { success: false, error: statusToErrorCodeMap[res.status] };
}
