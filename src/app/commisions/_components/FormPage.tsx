import { ClientDetailsFormStep } from "@/app/commisions/_components/clientDetailPage/ClientDetailsFormStep";
import { AddPiecesFormStep } from "@/app/commisions/_components/addPiecesPage/AddPiecesFormStep";
import { AddOrderDetailsFormStep } from "@/app/commisions/_components/addOrderDetailsFormStep/AddOrderDetailsFormStep";
import { AcceptTermsAndConditionsFormStep } from "@/app/commisions/_components/acceptTermsAndConditionsFormStep/AcceptTermsAndConditionsFormStep";

type FormPageProps = {
  step: number;
};

export default function FormPage({ step }: FormPageProps) {
  if (step === 0) {
    return (
      <div className={`w-full flex flex-col flex-1 min-h-0 gap-2`}>
        <ClientDetailsFormStep />
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className={`w-full flex flex-col flex-1 min-h-0 gap-2`}>
        <AddPiecesFormStep />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className={`w-full flex flex-col flex-1 min-h-0 gap-2`}>
        <AddOrderDetailsFormStep />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className={`w-full flex flex-col flex-1 min-h-0 gap-2`}>
        <AcceptTermsAndConditionsFormStep />
      </div>
    );
  }

  return null;
}
