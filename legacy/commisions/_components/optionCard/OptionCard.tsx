import Image from "next/image";
import "./OptionCard.styles.css";
import { useCallback, useLayoutEffect, useReducer, useRef } from "react";
import clsx from "clsx";
import {
  getConfigByPieceType,
  getEmptyPieceOrderDetail,
  getSizeLabel,
  isSizedPiece,
  Piece,
  PieceOrderDetail,
  pieceOrderDetailSchema,
  SizeOption,
} from "@/models/Piece";
import { TextArea } from "@/ui/TextArea";

export type Option = {
  type: Piece["type"];
  designIdeasPlaceholder: string;
};

type OptionCardProps = Option & {
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onAddToOrder: (pieceDetail: PieceOrderDetail) => void;
};

type PieceOrderDetailFormAction =
  | { actionType: "setQuantity"; quantity: number }
  | { actionType: "setSize"; size: SizeOption }
  | { actionType: "setDescription"; description: string }
  | { actionType: "reset" };

type PieceOrderDetailFormState = {
  valid: boolean;
  pieceDetail: PieceOrderDetail;
};

export function OptionCard({
  designIdeasPlaceholder,
  isExpanded,
  type,
  onExpand,
  onAddToOrder,
}: OptionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [formState, dispatchPieceDetail] = useReducer(
    (
      prevState: PieceOrderDetailFormState,
      action: PieceOrderDetailFormAction,
    ) => {
      const pieceDetail = pieceOrderDetailSchema.safeParse({
        ...prevState.pieceDetail,
        ...action,
      });

      if (action.actionType === "reset") {
        return {
          valid: false,
          pieceDetail: getEmptyPieceOrderDetail(type),
        };
      }

      return {
        valid: pieceDetail.success,
        pieceDetail: {
          ...prevState.pieceDetail,
          ...action,
        },
      };
    },
    {
      valid: false,
      pieceDetail: getEmptyPieceOrderDetail(type),
    },
  );

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatchPieceDetail({
        actionType: "setQuantity",
        quantity: Number(e.target.value),
      });
    },
    [],
  );

  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatchPieceDetail({
        actionType: "setSize",
        size: e.target.value as SizeOption,
      });
    },
    [],
  );

  const handleCommentsChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatchPieceDetail({
        actionType: "setDescription",
        description: e.target.value,
      });
    },
    [],
  );

  const handleAddToOrder = useCallback(() => {
    dispatchPieceDetail({ actionType: "reset" });
    onAddToOrder(formState.pieceDetail);
  }, [onAddToOrder, formState.pieceDetail, dispatchPieceDetail]);

  const handleExpand = useCallback(() => {
    onExpand(type);
  }, [onExpand, type]);

  useLayoutEffect(() => {
    if (!isExpanded) return;

    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isExpanded]);

  const pieceConfig = getConfigByPieceType(type);

  return (
    <div
      className={clsx(
        "option-card transition-all duration-300",
        isExpanded ? "expanded" : "",
      )}
    >
      <button
        className="option-card-heading"
        aria-expanded={isExpanded}
        aria-controls="card-content-bowls"
        onClick={handleExpand}
      >
        <Image
          src={pieceConfig.icon}
          alt="bowls"
          className="option-card-image inline w-1/4 h-auto"
          width={100}
          height={100}
        />
        <div className="option-card-title-container">
          <div className="text-sm font-button text-earth-dark">
            {pieceConfig.label}
          </div>
        </div>
      </button>
      <div
        id="card-content-bowls"
        ref={cardRef}
        className={clsx(
          "card-controls",
          "w-full",
          isExpanded ? "card-controls expanded" : "card-controls",
        )}
      >
        <div className="card-controls-content w-full">
          <fieldset className="flex flex-col gap-4">
            <div className="flex items-end gap-4 w-full">
              <div className="flex flex-col gap-1 empty:hidden flex-1 items-start min-w-fit">
                {isSizedPiece(formState.pieceDetail) ? (
                  <>
                    <legend className="text-sm font-label text-earth-dark">
                      Size
                    </legend>
                    <div className="flex flex-row gap-1">
                      {pieceConfig.sizes.map((size) => (
                        <label
                          key={size}
                          htmlFor={`${type}-${size}`}
                          className={clsx(
                            "aliciap-radio-button",
                            "flex-grow",
                            isSizedPiece(formState.pieceDetail) &&
                              formState.pieceDetail.size === size &&
                              "aliciap-radio-button-checked",
                          )}
                        >
                          <input
                            name={`${type}-size`}
                            id={`${type}-${size}`}
                            required
                            type="radio"
                            value={size}
                            className="sr-only"
                            checked={
                              isSizedPiece(formState.pieceDetail) &&
                              formState.pieceDetail.size === size
                            }
                            onChange={handleSizeChange}
                          />
                          <span>{getSizeLabel(size)}</span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
              <div className="flex flex-col gap-1 flex-1 items-start">
                <legend className="text-sm font-label text-earth-dark">
                  Quantity
                </legend>

                <input
                  type="number"
                  className="aliciap-input-auto"
                  placeholder="quantity"
                  onChange={handleQuantityChange}
                  min={1}
                  value={formState.pieceDetail.quantity}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full items-start">
              <TextArea
                placeholder={designIdeasPlaceholder}
                onChange={handleCommentsChange}
                value={formState.pieceDetail.description}
                label="Describe your ideal piece(s)"
                containerClassName="items-start"
                required
              />
            </div>
            <button
              className="aliciap-btn aliciap-btn-md aliciap-btn-primary w-full"
              onClick={handleAddToOrder}
              disabled={!formState.valid}
            >
              Add to order
            </button>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
