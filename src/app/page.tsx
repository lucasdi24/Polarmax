'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Stepper from '@/components/Stepper';
import MaterialSelector from '@/components/MaterialSelector';
import GlassInput from '@/components/GlassInput';
import ResultView from '@/components/ResultView';
import { useCotizador } from '@/hooks/useCotizador';

export default function Home() {
  const {
    state,
    allResults,
    hasDVH,
    selectMaterial,
    updateGlasses,
    calculate,
    goToStep,
    reset,
  } = useCotizador();

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-12">
        <Stepper currentStep={state.step} />

        {state.step === 1 && <MaterialSelector onSelect={selectMaterial} />}

        {state.step === 2 && state.selectedMaterial && state.selectedVariant && (
          <GlassInput
            glasses={state.glasses}
            onUpdate={updateGlasses}
            onSubmit={calculate}
            onBack={() => goToStep(1)}
            materialName={state.selectedMaterial.name}
            variantName={state.selectedVariant.label}
          />
        )}

        {state.step === 3 &&
          state.selectedMaterial &&
          state.selectedVariant && (
            <ResultView
              results={allResults}
              errors={state.errors}
              material={state.selectedMaterial}
              variant={state.selectedVariant}
              hasDVH={hasDVH}
              onBack={() => goToStep(2)}
              onReset={reset}
            />
          )}
      </main>
      <Footer />
    </>
  );
}
