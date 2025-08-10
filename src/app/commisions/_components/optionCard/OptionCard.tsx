import Image from "next/image";
import "./OptionCard.styles.css";
import { useCallback, useLayoutEffect, useRef } from "react";
import clsx from "clsx";
import { CardOptionsFormField } from "@/app/commisions/_data/steps";

type OptionCardProps = CardOptionsFormField["options"][number] & {
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onAddToOrder: () => void;
};

export function OptionCard({
  label,
  image,
  sizes,
  isExpanded,
  id,
  onExpand,
  onAddToOrder,
}: OptionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

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
                          className="aliciap-radio-button aliciap-btn-primary flex-grow"
                        >
                          <input
                            type="radio"
                            value={size}
                            className="sr-only"
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
                  onChange={() => {}}
                  min={1}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full items-start  ">
              <legend className="text-sm font-label text-earth-dark">
                Comments
              </legend>
              <textarea
                className="aliciap-textarea w-full aliciap-input"
                placeholder="comments"
                onChange={() => {}}
              />
            </div>
            <button
              className="aliciap-btn aliciap-btn-md aliciap-btn-primary w-full"
              onClick={onAddToOrder}
            >
              Add to order
            </button>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
