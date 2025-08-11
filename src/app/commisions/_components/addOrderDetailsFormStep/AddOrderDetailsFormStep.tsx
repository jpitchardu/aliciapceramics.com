import { TextInput } from "@/ui/TextInput";
import { TextArea } from "@/ui/TextArea";
import { OrderSummary } from "@/app/commisions/_components/orderSummary/OrderSummary";

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
    <div className="flex-shrink-0 gap-4 max-h-full flex flex-col">
      <div className="flex-shrink-0 px-8">
        <h2 className="font-heading text-2xl mb-1 text-earth-dark">
          {stepData.title}
        </h2>
        <p className="font-body text-sm  text-earth-dark">{stepData.body}</p>
      </div>
      <OrderSummary />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-4 space-y-4 px-8">
          {stepData.fields.map((field) => getComponent(field))}
        </div>
      </div>
    </div>
  );
}

function getComponent(
  field: (typeof stepData.fields)[number]
): React.ReactNode {
  switch (field._type) {
    case "input":
      return <TextInput key={field.label} {...field} onChange={() => {}} />;
    case "textarea":
      return <TextArea key={field.label} {...field} onChange={() => {}} />;
  }
}
