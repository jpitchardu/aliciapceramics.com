import clsx from "clsx";

export function FormProgress({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
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
}
