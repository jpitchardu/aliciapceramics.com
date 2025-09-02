type FormFooterProps = {
  backLabel?: string;
  nextLabel?: string;
  lastStepLabel?: string;
  isLastStep?: boolean;
  canGoBack?: boolean;
  canGoNext?: boolean;
  onBack?: () => void;
  onNext?: () => void;
};

export const FormFooter = ({
  backLabel = "back",
  nextLabel = "continue →",
  lastStepLabel = "order",
  isLastStep,
  canGoBack,
  canGoNext,
  onBack,
  onNext,
}: FormFooterProps) => (
  <div className="flex justify-between mt- w-full px-8 pt-4">
    {canGoBack ? (
      <button
        className="aliciap-btn aliciap-btn-secondary aliciap-btn-md font-button"
        onClick={onBack}
        disabled={!canGoBack}
      >
        {backLabel}
      </button>
    ) : null}
    {onNext ? (
      <button
        className="aliciap-btn aliciap-btn-primary aliciap-btn-md font-button"
        onClick={onNext}
        disabled={!canGoNext}
      >
        {isLastStep ? lastStepLabel : nextLabel}
      </button>
    ) : null}
  </div>
);
