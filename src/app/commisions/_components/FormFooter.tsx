type FormFooterProps = {
  backLabel?: string;
  nextLabel?: string;
  canGoBack?: boolean;
  canGoNext?: boolean;
  onBack?: () => void;
  onNext?: () => void;
};

export const FormFooter = ({
  backLabel = "back",
  nextLabel = "continue →",
  canGoBack,
  canGoNext,
  onBack,
  onNext,
}: FormFooterProps) => (
  <div className="flex justify-between mt-4 w-full px-8">
    {onBack ? (
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
        {nextLabel}
      </button>
    ) : null}
  </div>
);
