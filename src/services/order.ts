import { Order } from "@/models/Order";

export async function createOrder(order: Order) {
  const res = await fetch("/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  });

  return res.ok;
}
