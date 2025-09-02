import React from "react";
import { useFormContext } from "./FormContext";

type FormStepPageProps = {
  stepKey: string;
  children: React.ReactNode;
};

export function FormStepPage({ stepKey, children }: FormStepPageProps) {
  const { isStepActive, currentStep } = useFormContext();

  if (!isStepActive(stepKey)) {
    return null;
  }

  return (
    <div className="w-full flex flex-col flex-1 min-h-0 gap-2 px-8 h-full">
      {children}
    </div>
  );
}
