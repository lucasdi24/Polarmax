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
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto py-6">
      {STEPS.map((step, i) => {
        const isActive = step.number === currentStep;
        const isDone = step.number < currentStep;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : isDone
                      ? 'bg-accent/20 text-accent'
                      : 'bg-border text-muted'
                }`}
              >
                {isDone ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${
                  isActive ? 'text-accent' : 'text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 ${
                  step.number < currentStep ? 'bg-accent/40' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
