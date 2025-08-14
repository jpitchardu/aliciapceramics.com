import { StarRain } from "@/ui/StarRain";

export function OrderConfirmedFormStep() {
  return (
    <div className={`w-full flex flex-col flex-1 min-h-0 gap-2 px-8 h-full`}>
      <StarRain stars={10} />
      <div className="flex flex-col h-full items-center justify-center relative">
        <h2 className="font-heading text-2xl mb-1 text-earth-dark text-center">
          sent!
        </h2>
        <p className="font-body text-sm mb-4 text-earth-dark text-center">
          I can't wait to create with you
        </p>
      </div>
    </div>
  );
}
