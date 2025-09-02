import { OrderSummary } from "@/app/commisions/_components/OrderSummary";
import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { Form } from "@/ui/form/Form";
import { DollarIcon } from "@/ui/icons/DollarIcon";
import { LightbulbIcon } from "@/ui/icons/LightBulbIcon";
import { StarIcon } from "@/ui/icons/StartIcon";
import { ChangeEvent } from "react";

const stepKey = "accept-terms";

export function AcceptTermsAndConditionsFormStep() {
  const {
    dispatchOrderChange,
    orderFormState: { order, isOrderValid },
  } = useOrderContext();

  const handleConsentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    dispatchOrderChange({
      type: "accept-terms-and-conditions",
      payload: { consent: value },
    });
  };

  // <div className="flex-shrink-0 gap-4 max-h-full flex flex-col">

  return (
    <Form.StepPage stepKey={stepKey}>
      <Form.Header
        title="your pottery timeline"
        description="from conversation to creation in 4 simple steps"
      />
      <OrderSummary />
      <div className="flex-1 min-h-0 overflow-y-scroll flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row ">
            <div className="flex flex-col gap-2 items-center">
              <span className="text-xl bg-(--color-red-focus) rounded-full p-2">
                💬
              </span>
              <p className=" font-label text-earth-dark text-center">
                chat
                <br />
                ~1 day
              </p>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <span className="text-xl text-(--color-red-focus) p-2">→</span>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <span className="text-xl bg-(--color-red-focus) rounded-full p-2">
                ✏️
              </span>
              <p className="font-label text-earth-dark text-center">
                design together
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xl text-(--color-red-focus) p-2">→</span>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <span className="text-xl bg-(--color-red-focus) rounded-full p-2">
                🏺
              </span>
              <p className=" font-label text-earth-dark text-center">
                craft
                <br />
                10 wks
              </p>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <span className="text-xl text-(--color-red-focus) p-2">→</span>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <span className="text-xl bg-(--color-red-focus) rounded-full p-2">
                ✨
              </span>
              <p className=" font-label text-earth-dark text-center">
                enjoy forever
              </p>
            </div>
          </div>

          <div className="info-panel">
            <h3 className="font-heading text-sm mb-2 text-earth-dark">
              important details
            </h3>

            <p className="font-body text-sm mb-4 text-earth-dark text-left">
              <StarIcon color="#d62411" className="inline-block mr-2" />
              <span className="font-bold">Handmade nature:</span> Each piece is
              unique with intentional variations that make it yours alone
            </p>
            <p className="font-body text-sm mb-4 text-earth-dark text-left">
              <LightbulbIcon color="#d62411" className="inline-block mr-2" />
              <span className="font-bold">Creative process:</span>Sometimes clay
              teaches us new directions—I'll always check with you about any
              adjustments
            </p>
            <p className="font-body text-sm mb-4 text-earth-dark text-left">
              <DollarIcon color="#d62411" className="inline-block mr-2" />
              <span className="font-bold">Payment:</span> I'll send an invoice
              after we've discussed the details
            </p>
          </div>
          <div className="bg-(--color-stone-disabled) rounded-lg p-4 flex flex-row items-center gap-2">
            <input
              id="terms-and-conditions"
              className="aliciap-checkbox"
              type="checkbox"
              onChange={handleConsentChange}
              checked={order.consent}
            />
            <label
              htmlFor="terms-and-conditions"
              className="font-body text-sm text-earth-dark"
            >
              I understand this is a collaborative creative process and I'm
              excited to work together on my custom pieces
            </label>
          </div>
        </div>
      </div>
      <Form.Footer canGoNext={isOrderValid} nextLabel="let's do it" />
    </Form.StepPage>
  );
}

AcceptTermsAndConditionsFormStep.stepKey = stepKey;
