import Image from "next/image";
import "./OptionCard.styles.css";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  getAllSizes,
  Piece,
  PieceOrderDetail,
  SizeOption,
} from "@/models/Pieces";

export type Option = {
  id: Piece["type"];
  label: string;
  image: string;
  designIdeasPlaceholder: string;
  sizes?: string[];
};

type OptionCardProps = Option & {
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onAddToOrder: (pieceDetail: PieceOrderDetail) => void;
};

export function OptionCard({
  label,
  image,
  sizes,
  designIdeasPlaceholder,
  isExpanded,
  id,
  onExpand,
  onAddToOrder,
}: OptionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<SizeOption["label"]>();
  const [comments, setComments] = useState<string>();

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuantity(Number(e.target.value));
    },
    []
  );

  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedSize(e.target.value as SizeOption["label"]);
    },
    []
  );

  const handleCommentsChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setComments(e.target.value);
    },
    []
  );

  const handleAddToOrder = useCallback(() => {
    onAddToOrder({
      type: id,
      quantity,
      size: getAllSizes().find((size) => size.label === selectedSize)?.value,
      comments,
    } as PieceOrderDetail);
  }, [onAddToOrder, id, quantity, selectedSize, comments]);

  const handleExpand = useCallback(() => {
    onExpand(id);
  }, [onExpand, id]);

  useLayoutEffect(() => {
    if (!isExpanded) return;

    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isExpanded]);

  return (
    <div
      className={clsx(
        "option-card transition-all duration-300",
        isExpanded ? "expanded" : ""
      )}
    >
      <button
        className="option-card-heading"
        aria-expanded={isExpanded}
        aria-controls="card-content-bowls"
        onClick={handleExpand}
      >
        <Image
          src={image}
          alt="bowls"
          className="option-card-image inline w-1/4 h-auto"
          width={100}
          height={100}
        />
        <div className="option-card-title-container">
          <div className="text-sm font-button text-earth-dark">{label}</div>
        </div>
      </button>
      <div
        id="card-content-bowls"
        ref={cardRef}
        className={clsx(
          "card-controls",
          "w-full",
          isExpanded ? "card-controls expanded" : "card-controls"
        )}
      >
        <div className="card-controls-content w-full">
          <fieldset className="flex flex-col gap-4">
            <div className="flex items-end gap-4 w-full">
              <div className="flex flex-col gap-1 empty:hidden flex-1 items-start min-w-fit">
                {sizes ? (
                  <>
                    <legend className="text-sm font-label text-earth-dark">
                      Size
                    </legend>
                    <div className="flex flex-row gap-1">
                      {sizes.map((size) => (
                        <label
                          key={size}
                          htmlFor={`${id}-${size}`}
                          className={clsx(
                            "aliciap-radio-button",
                            "flex-grow",
                            selectedSize === size &&
                              "aliciap-radio-button-checked"
                          )}
                        >
                          <input
                            name={`${id}-size`}
                            id={`${id}-${size}`}
                            required
                            type="radio"
                            value={size}
                            className="sr-only"
                            checked={selectedSize === size}
                            onChange={handleSizeChange}
                          />
                          <span>{size}</span>
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
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full items-start  ">
              <legend className="text-sm font-label text-earth-dark">
                Describe your ideal piece(s)
              </legend>
              <textarea
                className="aliciap-textarea w-full aliciap-input"
                placeholder={designIdeasPlaceholder}
                onChange={handleCommentsChange}
              />
            </div>
            <button
              className="aliciap-btn aliciap-btn-md aliciap-btn-primary w-full"
              onClick={handleAddToOrder}
            >
              Add to order
            </button>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
