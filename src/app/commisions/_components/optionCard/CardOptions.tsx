import { useCallback, useState } from "react";
import { Option, OptionCard } from "./OptionCard";
import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { isSizedPiece, PieceOrderDetail } from "@/models/Pieces";

type CardOptionsProps = {
  options: Option[];
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
    (pieceDetail: PieceOrderDetail) => {
      setExpandedCardId(null);
      dispatchOrderChange({
        type: "add-piece-detail",
        payload: {
          pieceDetail: isSizedPiece(pieceDetail)
            ? {
                type: pieceDetail.type,
                quantity: pieceDetail.quantity,
                comments: pieceDetail.comments,
                size: pieceDetail.size,
              }
            : {
                type: pieceDetail.type,
                quantity: pieceDetail.quantity,
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
