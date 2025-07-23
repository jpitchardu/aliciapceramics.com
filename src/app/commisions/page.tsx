"use client";

import { FormFooter } from "@/app/commisions/_components/FormFooter";
import FormPage from "@/app/commisions/_components/FormPage";
import { ProgressBar } from "@/app/commisions/_components/ProgressBar";
import { COMMISION_REQUEST_FORM_STEPS } from "@/app/commisions/_data/steps";
import { useCallback, useState } from "react";

export default function CommisionsPage() {
  const maxSteps = COMMISION_REQUEST_FORM_STEPS.length;

  const [step, setStep] = useState(0);

  const handleNext = useCallback(() => {
    setStep(step + 1);
  }, [step]);

  const handleBack = useCallback(() => {
    setStep(step - 1);
  }, [step]);
  return (
    <div className="relative w-96 mh-m bg-earth-form  rounded-3xl p-8 shadow-xl  flex flex-col items-start justify-start overflow-hidden">
      <ProgressBar currentStep={step} totalSteps={maxSteps} />
      <FormPage step={step} />
      <FormFooter
        canGoBack={step > 0}
        canGoNext={step < maxSteps - 1}
        onNext={handleNext}
        onBack={handleBack}
      />
    </div>
  );
}
