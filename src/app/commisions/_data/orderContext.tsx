import { ActionDispatch, createContext, useContext, useReducer } from "react";
import z from "zod";
import invariant from "tiny-invariant";

const mugWithoutHandleSchema = z
  .object({
    type: z.literal("without-handle"),
    size: z.enum(["8 oz", "12 oz", "16 oz"]),
  })
  .brand("mug-without-handle");

const mugWithHandleSchema = z
  .object({
    type: z.literal("with-handle"),
    size: z.enum(["8 oz", "12 oz", "16 oz"]),
  })
  .brand("mug-with-handle");

const tumblerSchema = z
  .object({
    type: z.literal("tumbler"),
    size: z.enum(["8 oz", "12 oz", "16 oz"]),
  })
  .brand("tumbler");

const matchaBowlSchema = z
  .object({
    type: z.literal("matcha-bowl"),
  })
  .brand("matcha-bowl");

const dinnerwareSchema = z
  .object({
    type: z.literal("dinnerware"),
  })
  .brand("dinnerware");

const trinketDishSchema = z
  .object({
    type: z.literal("trinket-dish"),
  })
  .brand("trinket-dish");

const somethingElseSchema = z
  .object({
    type: z.literal("something-else"),
  })
  .brand("something-else");

const pieceSchema = z.discriminatedUnion("type", [
  mugWithoutHandleSchema,
  mugWithHandleSchema,
  tumblerSchema,
  matchaBowlSchema,
  dinnerwareSchema,
  trinketDishSchema,
  somethingElseSchema,
]);

const pieceDetailSchema = z.object({
  ...pieceSchema,
  quantity: z.number().min(1),
  comments: z.string().optional(),
});

type PieceDetail = z.infer<typeof pieceDetailSchema>;

const clientSchema = z.object({
  email: z.email(),
  name: z.string(),
  phone: z.string(),
});

type Client = z.infer<typeof clientSchema>;

const orderSchema = z.object({
  client: clientSchema,
  pieceDetails: z.array(pieceDetailSchema),
  description: z.string(),
  inspiration: z.string(),
  specialConsiderations: z.string(),
  timeline: z.date(),
});

type Order = z.infer<typeof orderSchema>;

type AddClientInfoAction = {
  type: "add-client-info";
  payload: {
    client: Client;
  };
};

type AddPieceAction = {
  type: "add-piece-detail";
  payload: {
    pieceDetail: PieceDetail;
  };
};

type AddVisionAction = {
  type: "add-vision";
  payload: {
    vision: string;
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
  | AddPieceAction
  | AddVisionAction
  | AddInspirationAction;

export type OrderContext = {
  order: Order;
  dispatchOrderChange: ActionDispatch<[action: OrderAction]>;
};

const EMPTY_ORDER: Order = {
  client: {
    email: "",
    name: "",
    phone: "",
  },
  pieceDetails: [],
  description: "",
  inspiration: "",
  specialConsiderations: "",
  timeline: new Date(),
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
        pieceDetails: [...order.pieceDetails, action.payload.pieceDetail],
      };
    case "add-vision":
      return {
        ...order,
        vision: action.payload.vision,
        timeline: action.payload.timeline,
      };
    case "add-inspiration":
      return {
        ...order,
        inspiration: action.payload.inspiration,
        specialConsiderations: action.payload.specialConsiderations,
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
