import { useState } from 'react';

/**
 * Componente para mostrar el progreso del flujo
 */
function FlowProgress({ currentStep, totalSteps, steps }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Flujo de Prueba de Morosidades</h2>
        <span className="text-sm font-medium text-gray-600">
          Paso {currentStep} de {totalSteps}
        </span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex-shrink-0">
            <div
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                index + 1 < currentStep
                  ? 'bg-green-100 text-green-800'
                  : index + 1 === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}. {step.label}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

export default FlowProgress;
