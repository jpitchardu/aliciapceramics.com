import { CardOptionsFormField } from "@/app/commisions/_data/steps";
import { useCallback, useState } from "react";
import { OptionCard } from "./OptionCard";

type CardOptionsProps = CardOptionsFormField & {
  onAddToOrder: () => void;
};

export function CardOptions({ options, onAddToOrder }: CardOptionsProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const handleExpand = useCallback(
    (id: string) => {
      setExpandedCardId(expandedCardId === id ? null : id);
    },
    [expandedCardId]
  );

  return (
    <>
      {options.map((option) => (
        <OptionCard
          key={option.id}
          {...option}
          onAddToOrder={onAddToOrder}
          isExpanded={expandedCardId === option.id}
          onExpand={handleExpand}
        />
      ))}
    </>
  );
}
