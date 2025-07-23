import clsx from "clsx";

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  return (
    <div className="flex justify-center gap-3 mb-8 w-full">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            "progress-dot",
            index < currentStep && "completed",
            index === currentStep && "active"
          )}
        />
      ))}
    </div>
  );
};
