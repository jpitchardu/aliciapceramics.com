import { useCallback, useMemo, useState } from "react";
import { FormFooter } from "./FormFooter";
import { FormHeader } from "./FormHeader";
import { FormProgress } from "./FormProgress";
import { FormContextValue, FormProvider } from "./FormContext";
import { FormStepPage } from "./FormStepPage";

type FormProps<TStepKey extends string> = {
  stepKeys: readonly TStepKey[];
  initialStep: TStepKey;
  isValid: boolean;
  children: React.ReactNode;
};

export function Form<TStepKey extends string>({
  stepKeys,
  initialStep,
  isValid,
  children,
}: FormProps<TStepKey>) {
  const [currentStep, setCurrentStep] = useState<TStepKey>(initialStep);

  const goNext = useCallback(() => {
    const currentIndex = stepKeys.indexOf(currentStep);
    if (currentIndex < stepKeys.length - 1) {
      setCurrentStep(stepKeys[currentIndex + 1]);
    }
  }, [currentStep, stepKeys]);

  const goBack = useCallback(() => {
    const currentIndex = stepKeys.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepKeys[currentIndex - 1]);
    }
  }, [currentStep, stepKeys]);

  const isStepActive = useCallback(
    (step: TStepKey) => currentStep === step,
    [stepKeys, currentStep]
  );

  const formContext = useMemo((): FormContextValue<TStepKey> => {
    return {
      steps: new Set(stepKeys),
      currentStep,
      isValid,
      isStepActive,
      goNext,
      goBack,
    };
  }, [stepKeys, currentStep, isValid, isStepActive, goNext, goBack]);

  return (
    <FormProvider value={formContext}>
      <div className="relative w-96 mh-m bg-earth-form max-h-[100svh] h-[900px] rounded-3xl py-8 shadow-xl flex flex-col items-start justify-start overflow-hidden">
        <FormProgress
          currentStep={stepKeys.indexOf(currentStep)}
          totalSteps={stepKeys.length}
        />
        {children}
      </div>
    </FormProvider>
  );
}

Form.Header = FormHeader;
Form.Progress = FormProgress;
Form.Footer = FormFooter;
Form.StepPage = FormStepPage;
