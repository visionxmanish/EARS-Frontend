import { useAddEconomicDataStore } from "../store/useAddEconomicDataStore";
import Stepper from "./stepper";
import Step1 from "./step1";
import Step2 from "./step2";



export function AddEconomicData() {
  const { step } = useAddEconomicDataStore();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <Stepper currentStep={step} />

      <div className="mt-8">
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
      </div>
    </div>
  );
}
