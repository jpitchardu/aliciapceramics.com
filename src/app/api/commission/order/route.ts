import { handleOrderRequest } from "@/lib/order-routes";

export const POST = (req: Request) => handleOrderRequest("commission", req);
