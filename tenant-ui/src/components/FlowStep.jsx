/**
 * Componente para renderizar un paso del flujo
 */
function FlowStep({ step, isCompleted, isActive, onExecute, isLoading, result, error }) {
  return (
    <div
      className={`border rounded-lg p-6 mb-4 transition-all ${
        isActive
          ? 'border-blue-600 bg-blue-50'
          : isCompleted
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{step.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
        </div>
        <div className="ml-4">
          {isCompleted ? (
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
              OK
            </div>
          ) : isActive ? (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse">
              *
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">
              {step.stepNumber}
            </div>
          )}
        </div>
      </div>

      {step.details && (
        <div className="bg-white rounded p-4 mb-4 text-sm text-gray-700 border border-gray-200">
          {step.details}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onExecute}
          disabled={isLoading || isCompleted}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Ejecutando...' : isCompleted ? 'Completado' : 'Ejecutar'}
        </button>

        {step.skipMessage && !isCompleted && (
          <button
            onClick={() => onExecute('skip')}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
            title={step.skipMessage}
          >
            Omitir
          </button>
        )}
      </div>

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-sm font-medium text-green-800">Resultado:</p>
          <pre className="text-xs text-green-700 mt-2 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm font-medium text-red-800">Error:</p>
          <p className="text-xs text-red-700 mt-2">{error}</p>
        </div>
      )}
    </div>
  );
}

export default FlowStep;
