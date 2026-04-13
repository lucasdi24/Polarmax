'use client';

const STEPS = [
  { number: 1, label: 'Material' },
  { number: 2, label: 'Medidas' },
  { number: 3, label: 'Resultado' },
] as const;

interface StepperProps {
  currentStep: 1 | 2 | 3;
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-sm mx-auto py-8">
      {STEPS.map((step, i) => {
        const isActive = step.number === currentStep;
        const isDone = step.number < currentStep;

        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  isActive
                    ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                    : isDone
                      ? 'bg-accent-lighter text-accent border-accent/30'
                      : 'bg-white text-muted border-border'
                }`}
              >
                {isDone ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-semibold ${
                  isActive ? 'text-accent' : isDone ? 'text-accent/60' : 'text-muted-light'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-3 mb-5">
                <div
                  className={`h-0.5 rounded-full ${
                    step.number < currentStep ? 'bg-accent/30' : 'bg-border'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
