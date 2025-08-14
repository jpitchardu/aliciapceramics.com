import { useCallback, useState } from "react";
import { Option, OptionCard } from "./OptionCard";
import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { PieceOrderDetail } from "@/models/Pieces";

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
          pieceDetail,
        },
      });
    },
    [dispatchOrderChange]
  );

  return (
    <>
      {options.map((option) => (
        <OptionCard
          key={option.type}
          {...option}
          onAddToOrder={handleAddToOrder}
          isExpanded={expandedCardId === option.type}
          onExpand={handleExpand}
        />
      ))}
    </>
  );
}
