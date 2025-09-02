import { useCallback } from "react";
import { useFormContext } from "./FormContext";

type FormFooterProps = {
  backLabel?: string;
  nextLabel?: string;
  canGoNext?: boolean;
  onBack?: () => void;
  onNext?: () => void;
};

export const FormFooter = ({
  backLabel = "back",
  nextLabel = "continue →",
  canGoNext = true,
  onBack,
  onNext,
}: FormFooterProps) => {
  const { goNext, goBack, steps, isStepActive } = useFormContext();

  const canMoveForward = canGoNext;

  const _onNext = useCallback(() => {
    if (onNext) onNext();
    goNext();
  }, [onNext, goNext]);

  const _onBack = useCallback(() => {
    if (onBack) onBack();
    goBack();
  }, [onBack, goBack]);

  const canGoBack = !isStepActive(Array.from(steps)[0]);

  return (
    <div className="flex justify-end space-x-4 mt- w-full pt-4">
      {canGoBack ? (
        <button
          className="flex-grow aliciap-btn aliciap-btn-secondary aliciap-btn-md font-button"
          onClick={_onBack}
        >
          {backLabel}
        </button>
      ) : null}
      {
        <button
          className="flex-grow aliciap-btn aliciap-btn-primary aliciap-btn-md font-button "
          onClick={_onNext}
          disabled={!canMoveForward}
        >
          {nextLabel}
        </button>
      }
    </div>
  );
};
