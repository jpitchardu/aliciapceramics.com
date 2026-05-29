import { Form } from "@/ui/form/Form";
import { StarRain } from "@/ui/StarRain";

const stepKey = "order-confirmed";

export function OrderConfirmedFormStep() {
  return (
    <Form.StepPage stepKey={stepKey}>
      <StarRain stars={10} />
      <div className="flex flex-col h-full items-center justify-center relative">
        <h2 className="font-heading text-2xl mb-1 text-earth-dark text-center">
          sent!
        </h2>
        <p className="font-body text-sm mb-4 text-earth-dark text-center">
          I can't wait to create with you
        </p>
      </div>
    </Form.StepPage>
  );
}

OrderConfirmedFormStep.stepKey = stepKey;
