import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { getConfigByPieceType } from "@/models/Pieces";
import Image from "next/image";
import { useCallback } from "react";

export function OrderSummary() {
  const { order, dispatchOrderChange } = useOrderContext();

  const handleRemovePieceDetail = useCallback(
    (id: string) => {
      dispatchOrderChange({
        type: "remove-piece-detail",
        payload: { id },
      });
    },
    [dispatchOrderChange]
  );

  return (
    <div className="flex flex-row gap-2 px-8 flex-wrap">
      {order.pieceDetails.map((detail) => (
        <button
          key={detail.type}
          className="aliciap-btn aliciap-btn-sm aliciap-btn-pill flex flex-row gap-2 flex-shrink-1"
          onClick={() => handleRemovePieceDetail(detail.id!)}
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
  );
}
