"use client";

import { createContext, useContext } from "react";
import { PIECE_RANGE, numberWords, type OrderKind } from "@/lib/wholesale";

/*
 * What differs between the bulk order and the small commission. The steps,
 * layout and behaviour are shared; this is the words, the piece range, and
 * whether prices are shown.
 */
export type Flow = {
  kind: OrderKind;
  /* /api/wholesale or /api/commission */
  api: string;
  storageKey: string;
  /* "bulk order" — the thing, singular */
  name: string;
  /* "bulk orders" — the tab title and the footer */
  plural: string;
  gateLabel: string;
  gateSub: string;
  gateSubShort: string;
  /* bulk orders ask for the shop; commissions are for a person */
  askBusiness: boolean;
  sheetTitle: string;
  /* commissions show the price sheet and a subtotal */
  priced: boolean;
  orderSub: string;
  consent: string;
  min: number;
  max: number;
};

export const FLOWS: Record<OrderKind, Flow> = {
  wholesale: {
    kind: "wholesale",
    api: "/api/wholesale",
    storageKey: "ws-bulk-order-v2",
    name: "bulk order",
    plural: "bulk orders",
    gateLabel: "for wholesale/bulk orders",
    gateSub:
      "bulk orders are for shops i've already been in touch with. if that's you, i'll have sent you a code — enter it below to get started.",
    gateSubShort:
      "if we've been in touch about a bulk order, enter the code i sent you.",
    askBusiness: true,
    sheetTitle: "your line sheet",
    priced: false,
    orderSub: "to your line sheet. add as many as you need.",
    consent:
      "everything looks right. i understand each piece is handmade, and that i'll be invoiced after we talk.",
    ...PIECE_RANGE.wholesale,
  },
  commission: {
    kind: "commission",
    api: "/api/commission",
    storageKey: "ws-commission-v1",
    name: "commission",
    plural: "commissions",
    gateLabel: "for small commissions",
    gateSub:
      "commissions are for people i've already said yes to. if that's you, i'll have sent you a code — enter it below to get started.",
    gateSubShort:
      "if we've talked about a commission, enter the code i sent you.",
    askBusiness: false,
    sheetTitle: "your order",
    priced: true,
    orderSub: "to your order. a small commission is one to nine pieces.",
    consent:
      "everything looks right. i understand each piece is handmade, that the price is a subtotal before tax and may change, and that i'll be invoiced after we talk.",
    ...PIECE_RANGE.commission,
  },
};

const FlowContext = createContext<Flow>(FLOWS.wholesale);
export const FlowProvider = FlowContext.Provider;
export const useFlow = () => useContext(FlowContext);

export const pieces = (n: number) => `${n} ${n === 1 ? "piece" : "pieces"}`;

/* the meter's caption and its line under the bar */
export function rangeText(flow: Flow, count: number) {
  if (flow.kind === "wholesale") {
    return {
      label: "a bulk order is ten pieces or more",
      status:
        count >= flow.min
          ? `that's ${count} pieces — you're past ten, whenever you're ready.`
          : `${count} so far · ${flow.min - count} more to reach ten.`,
      fill: Math.min(1, count / flow.min),
    };
  }
  const max = numberWords(flow.max);
  return {
    label: `a small commission is one to ${max} pieces`,
    status:
      count === 0
        ? `nothing yet — up to ${max} pieces.`
        : count < flow.max
          ? `${count} of ${max} · room for ${flow.max - count} more.`
          : count === flow.max
            ? `that's ${max} — the most for a small commission.`
            : `that's more than ${max} — take some off, or ask me about a bulk order.`,
    fill: Math.min(1, count / flow.max),
  };
}

/* spoken after every add and remove, so progress is heard on phones too,
 * where the meter sits inside the closed cart */
export function progressText(flow: Flow, n: number) {
  if (flow.kind === "wholesale") {
    return n >= flow.min
      ? `${n} pieces — past ten.`
      : `${pieces(n)} so far, ${flow.min - n} more to reach ten.`;
  }
  return n < flow.max
    ? `${pieces(n)} so far, room for ${flow.max - n} more.`
    : `${pieces(n)} — that's the most for a small commission.`;
}
