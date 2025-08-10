import { CardOptionsFormField } from "@/app/commisions/_data/steps";
import { useCallback, useState } from "react";
import { OptionCard } from "./OptionCard";
import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { Piece, SizeOption } from "@/models/Pieces";

type CardOptionsProps = CardOptionsFormField & {
  onAddToOrder: () => void;
};

export function CardOptions({ options }: CardOptionsProps) {
  const { dispatchOrderChange } = useOrderContext();

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const handleExpand = useCallback(
    (id: string) => {
      setExpandedCardId(expandedCardId === id ? null : id);
    },
    [expandedCardId]
  );

  const handleAddToOrder = useCallback(
    (pieceDetail: {
      type: Piece["type"];
      quantity: number;
      size: SizeOption["value"];
      comments?: string;
    }) => {
      setExpandedCardId(null);
      dispatchOrderChange({
        type: "add-piece-detail",
        payload: {
          pieceDetail: {
            type: pieceDetail.type,
            quantity: pieceDetail.quantity,
            size: pieceDetail.size,
            comments: pieceDetail.comments,
          },
        },
      });
    },
    [dispatchOrderChange]
  );

  return (
    <>
      {options.map((option) => (
        <OptionCard
          key={option.id}
          {...option}
          onAddToOrder={handleAddToOrder}
          isExpanded={expandedCardId === option.id}
          onExpand={handleExpand}
        />
      ))}
    </>
  );
}
