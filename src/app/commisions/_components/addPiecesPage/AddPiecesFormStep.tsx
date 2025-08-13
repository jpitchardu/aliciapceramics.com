import { CardOptions } from "@/app/commisions/_components/optionCard/CardOptions";
import { getConfigByPieceType } from "@/models/Pieces";
import { Option } from "@/app/commisions/_components/optionCard/OptionCard";

import { OrderSummary } from "@/app/commisions/_components/orderSummary/OrderSummary";

const stepData = {
  title: "what are you looking for?",
  body: "choose the piece(s) you want and leave a short description",
  fields: [
    {
      _type: "card-options",
      label: "what are you looking for?",
      options: [
        {
          id: "matcha-bowl",
          designIdeasPlaceholder:
            "Traditional but with 'overpriced grass water' on the bottom",
          ...getConfigByPieceType("matcha-bowl"),
        },
        {
          id: "mug-with-handle",
          ...getConfigByPieceType("mug-with-handle"),
          designIdeasPlaceholder:
            "Coffee mug with a tiny handle because I have small hands",
        },
        {
          id: "tumbler",
          ...getConfigByPieceType("tumbler"),
          designIdeasPlaceholder:
            "Covered in little crying faces that match my energy",
        },
        {
          id: "mug-without-handle",
          ...getConfigByPieceType("mug-without-handle"),
          designIdeasPlaceholder:
            "A mug that says 'I'm not a morning person' in tiny letters on the bottom",
        },
        {
          id: "trinket-dish",
          ...getConfigByPieceType("trinket-dish"),
          designIdeasPlaceholder: "Shaped like a tiny bathtub for my jewelry",
        },

        {
          id: "dinnerware",
          ...getConfigByPieceType("dinnerware"),
          designIdeasPlaceholder:
            "Plate with 'SERVING SIZE: LOL' printed around the rim",
        },
        {
          id: "other",
          ...getConfigByPieceType("other"),
          designIdeasPlaceholder: "Vase shaped like my cat Milo (he's round)",
        },
      ] satisfies Option[],
    },
  ],
};

export function AddPiecesFormStep() {
  return (
    <div className="flex-shrink-0 gap-4 max-h-full flex flex-col">
      <div className="flex-shrink-0 px-8">
        <h2 className="font-heading text-2xl mb-1 text-earth-dark">
          {stepData.title}
        </h2>
        <p className="font-body text-sm text-earth-dark">{stepData.body}</p>
      </div>
      <OrderSummary />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-4 px-8">
          <CardOptions options={stepData.fields[0].options} />
        </div>
      </div>
    </div>
  );
}
