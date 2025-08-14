"use client";

import { FormFooter } from "@/app/commisions/_components/FormFooter";
import FormPage from "@/app/commisions/_components/FormPage";
import { ProgressBar } from "@/app/commisions/_components/ProgressBar";
import { useOrderContext } from "@/app/commisions/_data/orderContext";
import { useCallback, useState } from "react";

export default function CommisionsPage() {
  const [step, setStep] = useState(0);

  const {
    orderFormState: { isOrderValid },
  } = useOrderContext();

  const handleNext = useCallback(() => {
    setStep(step + 1);
  }, [step]);

  const handleBack = useCallback(() => {
    setStep(step - 1);
  }, [step]);

  const canGoNext = step < 3 || isOrderValid;

  return (
    <div className="flex justify-center items-center h-screen radius-xl w-screen">
      <div className="relative  w-96 mh-m bg-earth-form  max-h-[100svh] h-[900px]  rounded-3xl py-8 shadow-xl  flex flex-col items-start justify-start overflow-hidden">
        <ProgressBar currentStep={step} totalSteps={4} />
        <FormPage step={step} />
        <FormFooter
          canGoBack={step > 0}
          canGoNext={canGoNext}
          onNext={handleNext}
          onBack={handleBack}
          isLastStep={step === 3}
        />
      </div>
    </div>
  );
}
