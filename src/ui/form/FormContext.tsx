import { createContext, ReactNode, useContext } from "react";

export type FormContextValue<TStepKey> = {
  steps: Set<TStepKey>;
  currentStep: TStepKey | null;
  isValid: boolean;
  isStepActive: (step: TStepKey) => boolean;
  goNext: () => void;
  goBack: () => void;
};

const FormContext = createContext<FormContextValue<any> | null>(null);

export function useFormContext<TStepKey>(): FormContextValue<TStepKey> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a Form component");
  }
  return context as FormContextValue<TStepKey>;
}

type FormProviderProps<TStepKey extends string> = {
  value: FormContextValue<TStepKey>;
  children: React.ReactNode;
};

export function FormProvider<TStepKey extends string>({
  value,
  children,
}: FormProviderProps<TStepKey>) {
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}
