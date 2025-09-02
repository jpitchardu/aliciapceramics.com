import { TextInput } from "@/ui/TextInput";
import { useOrderContext } from "@/app/commisions/_data/orderContext";

import { Order, orderClientSchema } from "@/models/Order";
import { OrderSummary } from "@/app/commisions/_components/OrderSummary";
import { Form } from "@/ui/form/Form";
import { useFormContext } from "@/ui/form/FormContext";
import z from "zod";

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

const stepKey = "client-details" as const;

export function ClientDetailsFormStep() {
  const {
    orderFormState: { order, error },
    dispatchOrderChange,
  } = useOrderContext();

  const handleChange = (path: keyof Order["client"], value: string) => {
    dispatchOrderChange({
      type: "add-client-info",
      payload: { client: { [path]: value } },
    });
  };

  const isValid = !(error && z.treeifyError(error).properties?.client);

  return (
    <Form.StepPage stepKey={stepKey}>
      <Form.Header title={stepData.title} description={stepData.body} />
      <OrderSummary />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-4 space-y-4">
          {stepData.fields.map((field) => (
            <TextInput
              key={field.label}
              label={field.label}
              placeholder={field.placeholder}
              required={field.required}
              type={field.type}
              value={order.client[field.path]}
              onChange={(e) => handleChange(field.path, e.target.value)}
            />
          ))}
        </div>
      </div>
      <Form.Footer canGoNext={isValid} />
    </Form.StepPage>
  );
}

ClientDetailsFormStep.stepKey = stepKey;
