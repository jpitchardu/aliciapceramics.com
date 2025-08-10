import { TextInput } from "@/app/commisions/_components/TextInput";
import { COMMISION_REQUEST_FORM_STEPS, FormField } from "../_data/steps";
import { TextArea } from "./TextArea";
import { Select } from "@/app/commisions/_components/Select";
import IconSelect from "@/app/commisions/_components/IconSelect";
import { CardOptions } from "@/app/commisions/_components/optionCard/CardOptions";
import { useOrderContext } from "@/app/commisions/_data/orderContext";
import Image from "next/image";
import { getConfigByPieceType } from "@/models/Pieces";

type FormPageProps = {
  step: number;
};

export default function FormPage({ step }: FormPageProps) {
  const stepData = COMMISION_REQUEST_FORM_STEPS[step];

  const { order, dispatchOrderChange } = useOrderContext();

  const pieceDetails = order.pieceDetails;

  return (
    <div className={`w-full flex flex-col flex-1 min-h-0 gap-2`}>
      <div className="flex-shrink-0 px-8">
        <h2 className="font-heading text-2xl mb-1 text-earth-dark">
          {stepData.title}
        </h2>
        <p className="font-body text-sm mb-4 text-earth-dark">
          {stepData.body}
        </p>
      </div>
      <div className="flex flex-row gap-2 px-8 flex-wrap">
        {pieceDetails.map((detail) => (
          <button
            key={detail.type}
            className="aliciap-btn aliciap-btn-sm aliciap-btn-pill flex flex-row gap-2 flex-shrink-1"
            onClick={() => {
              dispatchOrderChange({
                type: "remove-piece-detail",
                payload: { id: detail.id },
              });
            }}
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
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-4 space-y-4 px-8">
          {stepData.fields.map((field) => getComponent(field))}

          {stepData.infoCard ? (
            <div className="info-panel">
              <h3 className="font-heading text-sm mb-2 text-earth-dark">
                {stepData.infoCard.title}
              </h3>
              <p className="font-body text-sm mb-4 text-earth-dark">
                {stepData.infoCard.body}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getComponent(field: FormField): React.ReactNode {
  switch (field._type) {
    case "input":
      return <TextInput key={field.label} {...field} onChange={() => {}} />;
    case "textarea":
      return <TextArea key={field.label} {...field} onChange={() => {}} />;
    case "select":
      return <Select key={field.label} {...field} onChange={() => {}} />;
    case "icon-select":
      return <IconSelect key={field.label} {...field} onChange={() => {}} />;
    case "card-options":
      return (
        <CardOptions key={field.label} {...field} onAddToOrder={() => {}} />
      );
  }
}
