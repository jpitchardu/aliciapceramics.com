import { TextInput } from "@/ui/TextInput";
import { useOrderContext } from "@/app/commisions/_data/orderContext";

import { Order } from "@/models/Order";
import { OrderSummary } from "@/app/commisions/_components/orderSummary/OrderSummary";

const stepData = {
  title: "let's get some info",
  body: "we'll need a few things to get started",
  fields: [
    {
      label: "what should I call you?",
      placeholder: "your name",
      type: "text",
      required: true,
      path: "name",
    },
    {
      label: "email",
      placeholder: "you@example.com",
      type: "email",
      required: true,
      path: "email",
    },
    {
      label: "phone number (for quick updates)",
      placeholder: "(555) 123-4567",
      type: "tel",
      required: true,
      path: "phone",
    },
  ],
} as const;

export function ClientDetailsFormStep() {
  const { order, dispatchOrderChange } = useOrderContext();

  const handleChange = (path: keyof Order["client"], value: string) => {
    dispatchOrderChange({
      type: "add-client-info",
      payload: { client: { [path]: value } },
    });
  };

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
      <OrderSummary />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-4 space-y-4 px-8">
          {stepData.fields.map((field) => (
            <TextInput
              key={field.label}
              {...field}
              value={order.client[field.path]}
              onChange={(e) => handleChange(field.path, e.target.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
