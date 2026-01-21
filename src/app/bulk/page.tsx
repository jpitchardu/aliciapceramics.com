"use client";

import { useState } from "react";
import { CodeInputStep } from "./_components/CodeInputStep";
import { Form } from "@/ui/form/Form";
import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { ClientDetailsFormStep } from "@/app/commisions/_components/ClientDetailsFormStep";
import { AddPiecesFormStep } from "@/app/commisions/_components/AddPiecesFormStep";
import { AddOrderDetailsFormStep } from "@/app/commisions/_components/AddOrderDetailsFormStep";
import { AcceptTermsAndConditionsFormStep } from "@/app/commisions/_components/AcceptTermsAndConditionsFormStep";
import { OrderConfirmedFormStep } from "@/app/commisions/_components/OrderConfirmedFormStep";
import { useEffect } from "react";

const FORM_STEPS = [
  "client-details",
  "add-pieces",
  "order-details",
  "terms",
  "confirmed",
] as const;

type FormStep = (typeof FORM_STEPS)[number];

type BulkCodeData = {
  id: string;
  code: string;
  name: string;
  earliestCompletionDate: string;
};

export default function BulkCommissionPage() {
  const [bulkCodeData, setBulkCodeData] = useState<BulkCodeData | null>(null);
  const { orderFormState, dispatchOrderChange } = useOrderContext();

  useEffect(() => {
    if (bulkCodeData) {
      dispatchOrderChange({
        type: "add-order-details",
        payload: {
          timeline: new Date(bulkCodeData.earliestCompletionDate),
        },
      });
    }
  }, [bulkCodeData, dispatchOrderChange]);

  const getTotalPieceCount = () => {
    return orderFormState.order.pieceDetails.reduce(
      (sum, piece) => sum + piece.quantity,
      0,
    );
  };

  const isBulkOrderValid =
    orderFormState.isOrderValid && getTotalPieceCount() >= 10;

  if (!bulkCodeData) {
    return <CodeInputStep onCodeValidated={setBulkCodeData} />;
  }

  return (
    <div className="min-h-screen bg-earth-form flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-6 text-center">
        <h2 className="font-heading text-xl text-earth-dark">
          BULK ORDER: {bulkCodeData.name}
        </h2>
        <p className="font-body text-sm text-earth-dark mt-2">
          Code: {bulkCodeData.code}
        </p>
        <p className="font-body text-sm text-earth-dark">
          Minimum 10 pieces required
        </p>
      </div>

      <Form<FormStep>
        stepKeys={FORM_STEPS}
        initialStep="client-details"
        isValid={isBulkOrderValid}
      >
        <Form.StepPage step="client-details">
          <ClientDetailsFormStep />
        </Form.StepPage>

        <Form.StepPage step="add-pieces">
          <AddPiecesFormStep />
        </Form.StepPage>

        <Form.StepPage step="order-details">
          <AddOrderDetailsFormStep
            earliestDate={new Date(bulkCodeData.earliestCompletionDate)}
            isBulkOrder={true}
          />
        </Form.StepPage>

        <Form.StepPage step="terms">
          <AcceptTermsAndConditionsFormStep
            bulkCommissionCodeId={bulkCodeData.id}
          />
        </Form.StepPage>

        <Form.StepPage step="confirmed">
          <OrderConfirmedFormStep />
        </Form.StepPage>
      </Form>

      {getTotalPieceCount() > 0 && getTotalPieceCount() < 10 && (
        <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl max-w-md">
          <p className="font-body text-sm text-center">
            {10 - getTotalPieceCount()} more pieces needed to meet the minimum
          </p>
        </div>
      )}
    </div>
  );
}
