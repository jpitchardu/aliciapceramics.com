import { ActionDispatch, createContext, useContext, useReducer } from "react";
import invariant from "tiny-invariant";
import { PieceOrderDetail } from "@/models/Pieces";
import { EMPTY_ORDER, Order } from "@/models/Order";

type AddClientInfoAction = {
  type: "add-client-info";
  payload: {
    client: Order["client"];
  };
};

type AddPieceDetailAction = {
  type: "add-piece-detail";
  payload: {
    pieceDetail: PieceOrderDetail;
  };
};

type RemovePieceDetailAction = {
  type: "remove-piece-detail";
  payload: {
    id: PieceOrderDetail["id"];
  };
};

type AddDescriptionAction = {
  type: "add-description";
  payload: {
    description: string;
    timeline: Date;
  };
};

type AddInspirationAction = {
  type: "add-inspiration";
  payload: {
    inspiration: string;
    specialConsiderations: string;
  };
};

type OrderAction =
  | AddClientInfoAction
  | AddPieceDetailAction
  | AddDescriptionAction
  | AddInspirationAction
  | RemovePieceDetailAction;

export type OrderContext = {
  order: Order;
  dispatchOrderChange: ActionDispatch<[action: OrderAction]>;
};

const OrderContext = createContext<OrderContext>({
  order: EMPTY_ORDER,
  dispatchOrderChange: () => {},
});

const orderReducer = (order: Order, action: OrderAction) => {
  switch (action.type) {
    case "add-client-info":
      1;
      return {
        ...order,
        client: action.payload.client,
      };
    case "add-piece-detail":
      return {
        ...order,
        pieceDetails: [
          ...order.pieceDetails,
          {
            ...action.payload.pieceDetail,
            id: `${action.payload.pieceDetail.type}-${Date.now()}`,
          },
        ],
      };
    case "add-description":
      return {
        ...order,
        description: action.payload.description,
        timeline: action.payload.timeline,
      };
    case "add-inspiration":
      return {
        ...order,
        inspiration: action.payload.inspiration,
        specialConsiderations: action.payload.specialConsiderations,
      };
    case "remove-piece-detail":
      return {
        ...order,
        pieceDetails: order.pieceDetails.filter(
          (detail) => detail.id !== action.payload.id
        ),
      };
    default:
      invariant(false, "Invalid order action");
  }
};

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [order, dispatch] = useReducer(orderReducer, EMPTY_ORDER);

  return (
    <OrderContext.Provider value={{ order, dispatchOrderChange: dispatch }}>
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
