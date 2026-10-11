import { handleCodeRequest } from "@/lib/order-routes";

export const POST = (req: Request) => handleCodeRequest("commission", req);
