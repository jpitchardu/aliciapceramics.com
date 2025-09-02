"use client";

import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { Form } from "@/ui/form/Form";
import { ClientDetailsFormStep } from "./_components/ClientDetailsFormStep";
import { AddPiecesFormStep } from "./_components/AddPiecesFormStep";
import { AddOrderDetailsFormStep } from "./_components/AddOrderDetailsFormStep";
import { OrderConfirmedFormStep } from "./_components/OrderConfirmedFormStep";
import { AcceptTermsAndConditionsFormStep } from "./_components/AcceptTermsAndConditionsFormStep";

const STEPS = [
  ClientDetailsFormStep.stepKey,
  AddPiecesFormStep.stepKey,
  AddOrderDetailsFormStep.stepKey,
  AcceptTermsAndConditionsFormStep.stepKey,
  OrderConfirmedFormStep.stepKey,
] as const;

export default function CommisionsPage() {
  const {
    orderFormState: { isOrderValid },
  } = useOrderContext();

  return (
    <div className="flex justify-center items-center h-screen radius-xl w-screen">
      <Form
        stepKeys={STEPS}
        initialStep={"client-details"}
        isValid={isOrderValid}
      >
        <ClientDetailsFormStep />
        <AddPiecesFormStep />
        <AddOrderDetailsFormStep />
        <AcceptTermsAndConditionsFormStep />
        <OrderConfirmedFormStep />
      </Form>
    </div>
  );
}
