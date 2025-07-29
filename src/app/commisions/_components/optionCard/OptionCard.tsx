import Image from "next/image";
import "./OptionCard.styles.css";
import { useState } from "react";
import clsx from "clsx";
import { OptionCardFormField } from "@/app/commisions/_data/steps";

type OptionCardProps = OptionCardFormField & {
  onChange: (value: string) => void;
};

export function OptionCard({ label, image, sizes }: OptionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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
          </fieldset>
        </div>
      </div>
    </div>
  );
}
