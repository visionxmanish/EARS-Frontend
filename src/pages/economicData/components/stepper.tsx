import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, title: "Select FY and Place", status: "Completed" },
  { id: 2, title: "Select Sector", status: "Pending" },
  { id: 3, title: "Enter Data", status: "Pending" },
  { id: 4, title: "Review Data", status: "Pending" },
];


export default function Stepper({ currentStep }: { currentStep: number }) {
    const steps = STEPS;

  return (
    <div className="w-full py-4 overflow-x-auto scrollbar-hide">
      <div className="flex items-center min-w-max md:justify-center md:min-w-0 px-4">
        {STEPS.map((item, index) => {
          const isCompleted = currentStep > item.id;
          const isActive = currentStep === item.id;
          const isLast = index === steps.length - 1;

          return (
            <div key={item.id} className="flex items-center">
              <div className="flex flex-col items-center relative">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200 z-10 bg-white",
                    isCompleted
                      ? "bg-green-100 border-green-500 text-green-600"
                      : isActive
                      ? "border-blue-600 text-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"
                      : "border-gray-200 text-gray-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isActive ? (
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-200 rounded-full" />
                  )}
                </div>
                <div className="absolute top-12 whitespace-nowrap text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                    Step {item.id}
                  </p>
                  <p className={cn("text-sm font-semibold", isActive ? "text-gray-900" : "text-gray-500")}>
                    {item.title}
                  </p>
                  <p className={cn("text-xs", isCompleted ? "text-green-600" : isActive ? "text-blue-600" : "text-gray-400")}>
                     {isCompleted ? "Completed" : isActive ? "In Progress" : "Pending"}
                  </p>
                </div>
              </div>
              {!isLast && (
                <div className={cn("h-[2px] w-12 sm:w-24 mx-2", isCompleted ? "bg-green-500" : "bg-gray-200")} />
              )}
            </div>
          );
        })}
      </div>
      {/* Spacer for the absolute positioned text */}
      <div className="h-24" /> 
    </div>
  );
}
