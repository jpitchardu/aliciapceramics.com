import { OrderSummary } from "@/app/commisions/_components/OrderSummary";
import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { TextInput } from "@/ui/TextInput";
import { TextArea } from "@/ui/TextArea";
import { ChangeEvent } from "react";

export function AddOrderDetailsFormStep() {
  const {
    orderFormState: { order },
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

  return (
    <div className="flex-shrink-0 gap-4 max-h-full flex flex-col">
      <div className="flex-shrink-0 px-8">
        <h2 className="font-heading text-2xl mb-1 text-earth-dark">
          {"Your vision"}
        </h2>
        <p className="font-body text-sm  text-earth-dark">
          {"help me understand the vibes"}
        </p>
      </div>
      <OrderSummary />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-4 space-y-4 px-8">
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
            required={false}
          />
          <TextInput
            type="date"
            label="timeline (consider 2-3 months lead time)"
            placeholder="when would you love to have it by?"
            value={order.timeline.toISOString().split("T")[0]}
            onChange={handleTimelineChange}
          />
        </div>
      </div>
    </div>
  );
}
