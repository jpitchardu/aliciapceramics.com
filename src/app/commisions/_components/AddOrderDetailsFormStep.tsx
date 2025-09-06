import { OrderSummary } from "@/app/commisions/_components/OrderSummary";
import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { TextInput } from "@/ui/TextInput";
import { TextArea } from "@/ui/TextArea";
import { ChangeEvent } from "react";
import { Form } from "@/ui/form/Form";
import z from "zod";
import { getTwoMonthsFromNowInMinFormat } from "@/models/Order";

const stepKey = "add-order-details";

export function AddOrderDetailsFormStep() {
  const {
    orderFormState: { order, error },
    dispatchOrderChange,
  } = useOrderContext();

  const handleInspirationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatchOrderChange({
      type: "add-order-details",
      payload: { inspiration: value },
    });
  };

  const handleSpecialConsiderationsChange = (
    e: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    dispatchOrderChange({
      type: "add-order-details",
      payload: { specialConsiderations: value },
    });
  };

  const handleTimelineChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatchOrderChange({
      type: "add-order-details",
      payload: { timeline: new Date(value) },
    });
  };

  const errors = error
    ? {
        inspiration: z.treeifyError(error)?.properties?.inspiration,
        specialConsiderations:
          z.treeifyError(error)?.properties?.specialConsiderations,
        timeline: z.treeifyError(error)?.properties?.timeline,
      }
    : {};

  const isValid = Object.values(errors).every((v) => !!v);

  return (
    <Form.StepPage stepKey={stepKey}>
      <Form.Header
        title="Your vision"
        description="help me understand the vibes"
      />
      <OrderSummary />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-4 space-y-4">
          <div className=" w-full">
            <TextInput
              label="got inspiration?"
              placeholder="pinterest board, instagram, dropbox with screenshots, etc"
              value={order.inspiration}
              onChange={handleInspirationChange}
            />
          </div>
          <TextArea
            label="special considerations"
            placeholder="any special requests?"
            onChange={handleSpecialConsiderationsChange}
            value={order.specialConsiderations}
          />
          <TextInput
            type="date"
            min={getTwoMonthsFromNowInMinFormat()}
            label="timeline (consider 2-3 months lead time)"
            placeholder="when would you love to have it by?"
            value={order.timeline.toISOString().split("T")[0]}
            onChange={handleTimelineChange}
          />
          <div className="info-panel">
            <p className="font-body text-sm  text-earth-dark text-left">
              if you need this sooner, we can talk about it when I reach out to
              you.
            </p>
          </div>
        </div>
      </div>
      <Form.Footer canGoNext={isValid} />
    </Form.StepPage>
  );
}

AddOrderDetailsFormStep.stepKey = stepKey;
