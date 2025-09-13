import { TextInput } from "@/ui/TextInput";
import { useOrderContext } from "@/app/commisions/_data/orderContext";

import { Order } from "@/models/Order";
import { OrderSummary } from "@/app/commisions/_components/OrderSummary";
import { Form } from "@/ui/form/Form";
import z from "zod";
import { ChangeEvent, useCallback } from "react";

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

  const handleCommunicationChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value as "sms" | "email_only";
      if (value === "sms" || value === "email_only") {
        dispatchOrderChange({
          type: "set-communication-preference",
          payload: {
            communicationPreferences: value,
          },
        });
      }
    },
    [dispatchOrderChange],
  );

  const hasValidClientInfo = !(
    error && z.treeifyError(error).properties?.client
  );
  const hasCommunicationMethod =
    order.client.communicationPreferences === "sms" ||
    order.client.communicationPreferences === "email_only";
  const isValid = hasValidClientInfo && hasCommunicationMethod;

  return (
    <Form.StepPage stepKey={stepKey}>
      <Form.Header title={stepData.title} description={stepData.body} />
      <OrderSummary />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-4 space-y-4">
          {stepData.fields.map((field) => (
            <div key={field.label}>
              <TextInput
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                type={field.type}
                value={order.client[field.path]}
                onChange={(e) => handleChange(field.path, e.target.value)}
              />
            </div>
          ))}
          <fieldset className="mt-3">
            <legend className="block font-label text-sm text-earth-dark mb-2">
              how would you like to receive updates? *
            </legend>
            <div
              className="bg-(--color-stone-disabled) rounded-lg p-4"
              role="radiogroup"
              aria-required="true"
              aria-describedby="communication-help"
            >
              <div className="space-y-3">
                <div className="flex flex-row items-start gap-2">
                  <input
                    id="sms-consent-client"
                    name="communication-preference"
                    className="aliciap-radio mt-1"
                    type="radio"
                    value="sms"
                    onChange={handleCommunicationChange}
                    checked={order.client.communicationPreferences === "sms"}
                    aria-describedby="sms-details"
                  />
                  <label
                    htmlFor="sms-consent-client"
                    className="font-body text-xs text-stone-600"
                  >
                    <span>
                      I want to receive automated SMS updates from Alicia P
                      Ceramics. Msg&data rates may apply.
                    </span>
                  </label>
                </div>
                <div className="flex flex-row items-start gap-2">
                  <input
                    id="email-only-client"
                    name="communication-preference"
                    className="aliciap-radio mt-1"
                    type="radio"
                    value="email_only"
                    onChange={handleCommunicationChange}
                    checked={
                      order.client.communicationPreferences === "email_only"
                    }
                  />
                  <label
                    htmlFor="email-only-client"
                    className="font-body text-xs text-stone-600"
                  >
                    I prefer to receive all communication via email only
                  </label>
                </div>
              </div>
            </div>
            <div id="communication-help" className="sr-only">
              Choose how you would like to receive order updates. This selection
              is required.
            </div>
          </fieldset>
        </div>
      </div>
      <Form.Footer canGoNext={isValid} />
    </Form.StepPage>
  );
}

ClientDetailsFormStep.stepKey = stepKey;
