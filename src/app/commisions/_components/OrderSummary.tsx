import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { getConfigByPieceType } from "@/models/Piece";
import clsx from "clsx";
import Image from "next/image";
import { useCallback, useState } from "react";

export function OrderSummary() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const {
    orderFormState: { order },
    dispatchOrderChange,
  } = useOrderContext();

  const handleRemovePieceDetail = useCallback(
    (id: string) => {
      dispatchOrderChange({
        type: "remove-piece-detail",
        payload: { id },
      });
    },
    [dispatchOrderChange]
  );

  const canExpand = order.pieceDetails.length > 2;

  return (
    <div
      className={clsx(
        "flex",
        "flex-row",
        "flex-wrap",
        "gap-2",
        "w-full",
        "px-8",
        "transition-all",
        "duration-300"
      )}
    >
      {order.pieceDetails.map((detail) => (
        <button
          key={`${detail.type}-${detail.id}`}
          className={clsx(
            "aliciap-btn",
            "aliciap-btn-sm",
            "aliciap-btn-pill",
            "flex",
            "flex-row",
            "gap-2",
            "flex-shrink-1",
            isCollapsed && "nth-[n+3]:hidden!"
          )}
          onClick={() => handleRemovePieceDetail(detail.id!)}
        >
          <Image
            src={getConfigByPieceType(detail.type).icon}
            alt={getConfigByPieceType(detail.type).label}
            className="option-card-image inline min-w-8 min-h-8 max-w-8 max-h-8"
            width={30}
            height={30}
          />
          <span className="aliciap-text-md font-body text-ellipsis overflow-hidden whitespace-nowrap">
            {getConfigByPieceType(detail.type).label}
          </span>
          <span className="aliciap-text-sm bg-(--color-stone-disabled) rounded-full px-2 py-1">
            {detail.quantity}x
          </span>
        </button>
      ))}
      {canExpand && (
        <button
          className="aliciap-btn aliciap-btn-sm aliciap-btn-secondary w-full"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span className="aliciap-text-sm font-label">
            {isCollapsed ? "Show more" : "Show less"}
          </span>
        </button>
      )}
    </div>
  );
}
