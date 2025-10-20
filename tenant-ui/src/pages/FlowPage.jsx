import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import FlowProgress from '../components/FlowProgress';
import FlowStep from '../components/FlowStep';
import adminService from '../services/adminService';
import morosidadService from '../services/morosidadService';
import pagoService from '../services/pagoService';
import edificioService from '../services/edificioService';

/**
 * Página con flujo completo de prueba de morosidades
 */
function FlowPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingStep, setLoadingStep] = useState(null);
  const [steps, setSteps] = useState([
    {
      stepNumber: 1,
      label: 'Limpiar BD',
      title: 'Paso 1: Limpiar Base de Datos',
      description: 'Elimina todas las tablas y datos existentes para empezar desde cero.',
      details: 'Se eliminaran todos los registros del sistema.',
      completed: false,
      result: null,
      error: null,
    },
    {
      stepNumber: 2,
      label: 'Inicializar',
      title: 'Paso 2: Inicializar Sistema Completo',
      description: 'Crea todas las tablas base y carga datos iniciales (edificios, departamentos, residentes).',
      details: 'Se crearan 6 edificios, departamentos y residentes base.',
      completed: false,
      result: null,
      error: null,
    },
    {
      stepNumber: 3,
      label: 'Morosidades',
      title: 'Paso 3: Configurar Sistema de Morosidades',
      description: 'Crea paquetes PL/SQL, tablas de auditoría y triggers para el sistema de morosidades.',
      details: 'Se crearan: PKG_RESIDENTES, PKG_MOROSIDADES, DETALLE_MOROSIDAD, AUDITORIA_MOROSIDADES, AUDITORIA_PAGOS',
      completed: false,
      result: null,
      error: null,
    },
    {
      stepNumber: 4,
      label: 'Cargar Datos',
      title: 'Paso 4: Cargar Datos de Morosidad',
      description: 'Inserta 8 casos de prueba de morosidad con un total de deuda de $692,750.',
      details: 'Se cargaran: ALICIA OPAZO ($59,000), STEPHANIE DIAZ ($32,450), SANDRA ARIAS ($119,500), MARCIA BENITEZ ($196,650), y otros.',
      completed: false,
      result: null,
      error: null,
    },
    {
      stepNumber: 5,
      label: 'Generar Reporte',
      title: 'Paso 5: Generar Reporte de Morosidades (CRITICO)',
      description: 'Este es el paso mas importante: procesa deudas y llena la tabla DETALLE_MOROSIDAD.',
      details: 'Parametro: annoMes = 202510. SIN EJECUTAR ESTE PASO, LOS PASOS SIGUIENTES ESTARAN VACIOS.',
      completed: false,
      result: null,
      error: null,
    },
    {
      stepNumber: 6,
      label: 'Ver Morosos',
      title: 'Paso 6: Ver TODOS los Residentes Morosos',
      description: 'Consulta la tabla DETALLE_MOROSIDAD para ver todos los residentes con deuda.',
      details: 'Resultado esperado: 8 residentes morosos con deuda total de $692,750.',
      completed: false,
      result: null,
      error: null,
      skipMessage: 'Puede omitir si solo desea ver el resultado posterior',
    },
    {
      stepNumber: 7,
      label: 'Detalle SANDRA',
      title: 'Paso 7: Ver Detalle de SANDRA ARIAS',
      description: 'Consulta especifica de un residente moroso (RUN: 8948642).',
      details: 'Residente: SANDRA ARIAS - RUN: 8948642 - Deuda esperada: $119,500',
      completed: false,
      result: null,
      error: null,
      skipMessage: 'Puede omitir si solo desea ver el resultado posterior',
    },
    {
      stepNumber: 8,
      label: 'Registrar Pago',
      title: 'Paso 8: Registrar Pago Parcial de ALICIA',
      description: 'Registra un pago parcial de $30,000 para ALICIA OPAZO (deuda reducida a $29,000).',
      details: 'Edificio: 10 (Murano) - Depto: 21 - Pago: $30,000 - Periodo: 202508',
      completed: false,
      result: null,
      error: null,
    },
    {
      stepNumber: 9,
      label: 'Reporte Actualizado',
      title: 'Paso 9: Regenerar Reporte Actualizado',
      description: 'Vuelve a generar el reporte para reflejar el pago parcial registrado.',
      details: 'La deuda de ALICIA debe reducirse de $59,000 a $29,000.',
      completed: false,
      result: null,
      error: null,
    },
    {
      stepNumber: 10,
      label: 'Ver Actualizados',
      title: 'Paso 10: Ver Residentes Morosos Actualizados',
      description: 'Consulta la lista actualizada despues del pago parcial.',
      details: 'Verificar que la deuda de ALICIA se redujo a $29,000.',
      completed: false,
      result: null,
      error: null,
      skipMessage: 'Puede omitir si solo desea ver el resultado posterior',
    },
    {
      stepNumber: 11,
      label: 'Ver Edificios',
      title: 'Paso 11: Ver Todos los Edificios con Promedios',
      description: 'Lista todos los edificios con su promedio de morosidad calculado.',
      details: 'Se mostraran 6 edificios con sus promedios de morosidad.',
      completed: false,
      result: null,
      error: null,
      skipMessage: 'Puede omitir si solo desea ver el resultado posterior',
    },
    {
      stepNumber: 12,
      label: 'Auditoria Morosidades',
      title: 'Paso 12: Ver Auditoría de Morosidades',
      description: 'Muestra el historial de cambios en morosidades mayores a $100,000.',
      details: 'Registros esperados: SANDRA ARIAS ($119,500) y MARCIA BENITEZ ($196,650).',
      completed: false,
      result: null,
      error: null,
      skipMessage: 'Puede omitir si solo desea ver el resultado posterior',
    },
    {
      stepNumber: 13,
      label: 'Auditoria Pagos',
      title: 'Paso 13: Ver Auditoría de Pagos',
      description: 'Muestra TODOS los pagos registrados en el sistema.',
      details: 'Se esperan al menos 3 pagos registrados (2 del script + 1 del paso 8).',
      completed: false,
      result: null,
      error: null,
      skipMessage: 'Puede omitir si solo desea ver el resultado posterior',
    },
    {
      stepNumber: 14,
      label: 'Diagnostico',
      title: 'Paso 14: Diagnóstico Final del Sistema',
      description: 'Verifica que todo esté funcionando correctamente.',
      details: 'Verifica: Paquetes PL/SQL (VALID), Tablas creadas, Errores de compilación.',
      completed: false,
      result: null,
      error: null,
    },
  ]);

  const handleExecuteStep = async (stepIndex, action = 'execute') => {
    if (action === 'skip') {
      const newSteps = [...steps];
      newSteps[stepIndex].completed = true;
      setSteps(newSteps);
      setCurrentStep(stepIndex + 1);
      return;
    }

    setLoadingStep(stepIndex);
    const newSteps = [...steps];

    try {
      let result;

      switch (stepIndex) {
        case 0:
          result = await adminService.clearDatabase();
          break;
        case 1:
          result = await adminService.seedDatabase();
          break;
        case 2:
          result = await adminService.setupMorosidades();
          break;
        case 3:
          result = await adminService.cargarDatosMorosidad();
          break;
        case 4:
          result = await morosidadService.generarReporte(202510);
          break;
        case 5:
          result = await morosidadService.obtenerDetalle();
          break;
        case 6:
          result = await morosidadService.obtenerDetalle(8948642);
          break;
        case 7:
          result = await pagoService.registrarParcial({
            annoMes: 202508,
            idEdif: 10,
            nroDepto: 21,
            monto: 30000.0,
          });
          break;
        case 8:
          result = await morosidadService.generarReporte(202510);
          break;
        case 9:
          result = await morosidadService.obtenerDetalle();
          break;
        case 10:
          result = await edificioService.obtenerTodos();
          break;
        case 11:
          result = await morosidadService.obtenerAuditoria();
          break;
        case 12:
          result = await morosidadService.obtenerAuditoriaPagos();
          break;
        case 13:
          result = await adminService.obtenerDiagnostico();
          break;
        default:
          result = {};
      }

      newSteps[stepIndex].result = result;
      newSteps[stepIndex].error = null;
      newSteps[stepIndex].completed = true;
      setSteps(newSteps);
      setCurrentStep(Math.min(stepIndex + 1, steps.length));
    } catch (error) {
      newSteps[stepIndex].error = error.message;
      newSteps[stepIndex].result = null;
      setSteps(newSteps);
    } finally {
      setLoadingStep(null);
    }
  };

  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <MainLayout title="Flujo de Prueba Completo" subtitle="Sistema de Gestión de Morosidades">
      <div className="max-w-4xl mx-auto">
        <FlowProgress
          currentStep={currentStep}
          totalSteps={steps.length}
          steps={steps}
        />

        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">
                Progreso: <span className="font-bold text-blue-600">{completedCount}</span> de{' '}
                <span className="font-bold">{steps.length}</span> pasos completados
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Sigue los pasos en orden para ejecutar el flujo completo de prueba.
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentStep(0);
                setSteps(
                  steps.map((s) => ({
                    ...s,
                    completed: false,
                    result: null,
                    error: null,
                  }))
                );
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reiniciar Flujo
            </button>
          </div>
        </div>

        {steps.map((step, index) => (
          <FlowStep
            key={index}
            step={step}
            isCompleted={step.completed}
            isActive={index === currentStep}
            onExecute={(action) => handleExecuteStep(index, action)}
            isLoading={loadingStep === index}
            result={step.result}
            error={step.error}
          />
        ))}
      </div>
    </MainLayout>
  );
}

export default FlowPage;
