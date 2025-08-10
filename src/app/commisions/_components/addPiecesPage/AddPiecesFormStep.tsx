import { CardOptions } from "@/app/commisions/_components/optionCard/CardOptions";
import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { getAllSizes, getConfigByPieceType } from "@/models/Pieces";
import { Option } from "@/app/commisions/_components/optionCard/OptionCard";

import Image from "next/image";

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
          label: "matcha bowl",
          image: "/icons/matcha_bowl.png",
          designIdeasPlaceholder:
            "Traditional but with 'overpriced grass water' on the bottom",
        },
        {
          id: "mug-with-handle",
          label: "mug w handle",
          image: "/icons/mug_with_handle.png",
          sizes: getAllSizes().map((size) => size.label),
          designIdeasPlaceholder:
            "Coffee mug with a tiny handle because I have small hands",
        },
        {
          id: "tumbler",
          label: "tumbler",
          image: "/icons/tumbler.png",
          sizes: getAllSizes().map((size) => size.label),
          designIdeasPlaceholder:
            "Covered in little crying faces that match my energy",
        },
        {
          id: "mug-without-handle",
          label: "mug w/o handle",
          image: "/icons/mug_without_handle.png",
          sizes: getAllSizes().map((size) => size.label),
          designIdeasPlaceholder:
            "A mug that says 'I'm not a morning person' in tiny letters on the bottom",
        },
        {
          id: "trinket-dish",
          label: "trinket dish",
          image: "/icons/trinket_dish.png",
          designIdeasPlaceholder: "Shaped like a tiny bathtub for my jewelry",
        },

        {
          id: "dinnerware",
          label: "dinnerware",
          image: "/icons/plate.png",
          designIdeasPlaceholder:
            "Plate with 'SERVING SIZE: LOL' printed around the rim",
        },
        {
          id: "other",
          label: "something else",
          image: "/icons/vase.png",
          designIdeasPlaceholder: "Vase shaped like my cat Milo (he's round)",
        },
      ] satisfies Option[],
    },
  ],
};

export function AddPiecesFormStep() {
  const { order, dispatchOrderChange } = useOrderContext();

  const pieceDetails = order.pieceDetails;

  return (
    <>
      <div className="flex-shrink-0 px-8">
        <h2 className="font-heading text-2xl mb-1 text-earth-dark">
          {stepData.title}
        </h2>
        <p className="font-body text-sm text-earth-dark">{stepData.body}</p>
      </div>
      <div className="flex flex-row gap-2 px-8 flex-wrap">
        {pieceDetails.map((detail) => (
          <button
            key={detail.type}
            className="aliciap-btn aliciap-btn-sm aliciap-btn-pill flex flex-row gap-2 flex-shrink-1"
            onClick={() => {
              dispatchOrderChange({
                type: "remove-piece-detail",
                payload: { id: detail.id },
              });
            }}
          >
            <Image
              src={getConfigByPieceType(detail.type).icon}
              alt={getConfigByPieceType(detail.type).label}
              className="option-card-image inline w-1/4 h-auto"
              width={30}
              height={30}
            />
            <span className="aliciap-text-md, font-body text-ellipsis overflow-hidden whitespace-nowrap">
              {getConfigByPieceType(detail.type).label}
            </span>
            <span className="aliciap-text-sm bg-(--color-stone-disabled) rounded-full px-2 py-1">
              {detail.quantity}x
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-4 space-y-4 px-8">
          <CardOptions options={stepData.fields[0].options} />
        </div>
      </div>
    </>
  );
}
