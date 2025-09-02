import { ActionDispatch, createContext, useContext, useReducer } from "react";
import invariant from "tiny-invariant";
import { PieceOrderDetail } from "@/models/Piece";
import { getEmptyOrder, Order, orderSchema } from "@/models/Order";
import z from "zod";

type AddClientInfoAction = {
  type: "add-client-info";
  payload: {
    client: Partial<Order["client"]>;
  };
};

type AddPieceOrderDetailAction = {
  type: "add-piece-detail";
  payload: {
    pieceOrderDetail: PieceOrderDetail;
  };
};

type RemovePieceOrderDetailAction = {
  type: "remove-piece-detail";
  payload: {
    id: PieceOrderDetail["id"];
  };
};

type AddOrderDetailsAction = {
  type: "add-order-details";
  payload: Partial<{
    inspiration: string;
    specialConsiderations: string;
    timeline: Date;
  }>;
};

type AcceptTermsAndConditionsAction = {
  type: "accept-terms-and-conditions";
  payload: {
    consent: boolean;
  };
};
type OrderAction =
  | AddClientInfoAction
  | AddPieceOrderDetailAction
  | AddOrderDetailsAction
  | RemovePieceOrderDetailAction
  | AcceptTermsAndConditionsAction;

type OrderFormState = {
  order: Order;
  isOrderValid: boolean;
  error?: z.ZodError<Order>;
};

export type OrderContext = {
  orderFormState: OrderFormState;
  dispatchOrderChange: ActionDispatch<[action: OrderAction]>;
};

const OrderContext = createContext<OrderContext>({
  orderFormState: {
    order: getEmptyOrder(),
    isOrderValid: false,
  },
  dispatchOrderChange: () => {},
});

const orderReducer = ({ order }: OrderFormState, action: OrderAction) => {
  let newOrder: Order;

  switch (action.type) {
    case "add-client-info":
      newOrder = {
        ...order,
        client: { ...order.client, ...action.payload.client },
        consent: false,
      };
      break;
    case "add-piece-detail":
      newOrder = {
        ...order,
        pieceDetails: [
          ...order.pieceDetails,
          {
            ...action.payload.pieceOrderDetail,
            id: `${action.payload.pieceOrderDetail.type}-${Date.now()}`,
          },
        ],
        consent: false,
      };
      break;
    case "add-order-details":
      newOrder = {
        ...order,
        ...action.payload,
        consent: false,
      };
      break;
    case "remove-piece-detail":
      newOrder = {
        ...order,
        pieceDetails: order.pieceDetails.filter(
          (detail) => detail.id !== action.payload.id,
        ),
        consent: false,
      };
      break;
    case "accept-terms-and-conditions":
      newOrder = {
        ...order,
        consent: action.payload.consent,
      };
      break;
    default:
      invariant(false, "Invalid order action");
  }

  const parseResult = orderSchema.safeParse(newOrder);

  return {
    order: newOrder,
    isOrderValid: parseResult.success && parseResult.data.consent,
    error: parseResult.error,
  };
};

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [order, dispatch] = useReducer(orderReducer, {
    order: getEmptyOrder(),
    isOrderValid: false,
    error: orderSchema.safeParse(getEmptyOrder()).error,
  });

  return (
    <OrderContext.Provider
      value={{
        orderFormState: order,
        dispatchOrderChange: dispatch,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
}
