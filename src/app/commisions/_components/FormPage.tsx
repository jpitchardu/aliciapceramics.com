import { TextInput } from "@/app/commisions/_components/TextInput";
import { COMMISION_REQUEST_FORM_STEPS, FormField } from "../_data/steps";
import { TextArea } from "./TextArea";
import { Select } from "@/app/commisions/_components/Select";
import IconSelect from "@/app/commisions/_components/IconSelect";

type FormPageProps = {
  step: number;
};

export default function FormPage({ step }: FormPageProps) {
  const stepData = COMMISION_REQUEST_FORM_STEPS[step];

  return (
    <div className="w-full space-y-4">
      <div>
        <h2 className="font-heading text-2xl mb-1 text-earth-dark">
          {stepData.title}
        </h2>
        <p className="font-body text-sm mb-4 text-earth-dark">
          {stepData.body}
        </p>
        <div className="flex flex-col w-full z-10 space-y-4">
          {stepData.fields.map((field) => getComponent(field))}
        </div>
      </div>
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
  }
}
