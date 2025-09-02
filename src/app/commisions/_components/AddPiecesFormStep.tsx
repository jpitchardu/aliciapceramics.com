import { CardOptions } from "./CardOptions";
import { getConfigByPieceType } from "@/models/Piece";
import { Option } from "@/app/commisions/_components/optionCard/OptionCard";

import { OrderSummary } from "@/app/commisions/_components/OrderSummary";
import { Form } from "@/ui/form/Form";
import { useOrderContext } from "../_data/orderContext";
import z from "zod";

const stepData = {
  title: "what are you looking for?",
  body: "choose the piece(s) you want and leave a short description",
  fields: [
    {
      _type: "card-options",
      label: "what are you looking for?",
      options: [
        {
          type: "matcha-bowl",
          designIdeasPlaceholder:
            "Traditional but with 'overpriced grass water' on the bottom",
          ...getConfigByPieceType("matcha-bowl"),
        },
        {
          type: "mug-with-handle",
          ...getConfigByPieceType("mug-with-handle"),
          designIdeasPlaceholder:
            "Coffee mug with a tiny handle because I have small hands",
        },
        {
          type: "tumbler",
          ...getConfigByPieceType("tumbler"),
          designIdeasPlaceholder:
            "Covered in little crying faces that match my energy",
        },
        {
          type: "mug-without-handle",
          ...getConfigByPieceType("mug-without-handle"),
          designIdeasPlaceholder:
            "A mug that says 'I'm not a morning person' in tiny letters on the bottom",
        },
        {
          type: "trinket-dish",
          ...getConfigByPieceType("trinket-dish"),
          designIdeasPlaceholder: "Shaped like a tiny bathtub for my jewelry",
        },

        {
          type: "dinnerware",
          ...getConfigByPieceType("dinnerware"),
          designIdeasPlaceholder:
            "Plate with 'SERVING SIZE: LOL' printed around the rim",
        },
        {
          type: "other",
          ...getConfigByPieceType("other"),
          designIdeasPlaceholder: "Vase shaped like my cat Milo (he's round)",
        },
      ] satisfies Option[],
    },
  ],
};

const stepKey = "add-pieces" as const;

export function AddPiecesFormStep() {
  const {
    orderFormState: { error },
  } = useOrderContext();

  const isValid = Boolean(
    error && !z.treeifyError(error).properties?.pieceDetails?.errors
  );

  return (
    <Form.StepPage stepKey={stepKey}>
      <Form.Header title={stepData.title} description={stepData.body} />
      <OrderSummary />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-4">
          <CardOptions options={stepData.fields[0].options} />
        </div>
      </div>
      <Form.Footer canGoNext={isValid} />
    </Form.StepPage>
  );
}

AddPiecesFormStep.stepKey = stepKey;
