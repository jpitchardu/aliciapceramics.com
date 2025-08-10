import { TextInput } from "@/app/commisions/_components/TextInput";
import { FormField } from "@/app/commisions/_data/steps";
import { TextArea } from "@/app/commisions/_components/TextArea";
import { Select } from "@/app/commisions/_components/Select";
import IconSelect from "@/app/commisions/_components/IconSelect";

const stepData = {
  title: "your vision",
  body: "help me understand the vibes",
  fields: [
    {
      _type: "textarea",
      label: "got inspiration?",
      placeholder: "pinterest board, instagram, dropbox with screenshots, etc",
      required: true,
    },
    {
      _type: "input",
      label: "special considerations",
      placeholder: "any special requests?",
      type: "text",
      required: false,
    },
    {
      _type: "input",
      label: "timeline (consider 2-3 months lead time)",
      placeholder: "when would you love to have it by?",
      type: "date",
      required: false,
    },
  ],
  // infoCard: {
  //   title: "beware",
  //   body: "Because of high demand, I'm not always able to finish a piece in the time frame you're looking for.",
  // },
} as const;

export function AddOrderDetailsFormStep() {
  return (
    <>
      <div className="flex-shrink-0 px-8">
        <h2 className="font-heading text-2xl mb-1 text-earth-dark">
          {stepData.title}
        </h2>
        <p className="font-body text-sm  text-earth-dark">{stepData.body}</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-4 space-y-4 px-8">
          {stepData.fields.map((field) => getComponent(field))}
        </div>
      </div>
    </>
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
