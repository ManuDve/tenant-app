import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import pagoService from '../services/pagoService';
import edificioService from '../services/edificioService';
import { ErrorAlert, LoadingSpinner } from '../components/ui/StateComponents';

/**
 * Página para registrar pagos parciales
 */
function RegistroPagosPage() {
  const [formData, setFormData] = useState({
    annoMes: new Date().toISOString().slice(0, 7).replace('-', ''),
    idEdif: '',
    nroDepto: '',
    monto: '',
  });
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEdificios, setLoadingEdificios] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar edificios al montar
  useEffect(() => {
    const cargarEdificios = async () => {
      try {
        const data = await edificioService.obtenerTodos();
        setEdificios(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando edificios:', err);
        setEdificios([]);
      } finally {
        setLoadingEdificios(false);
      }
    };
    cargarEdificios();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const obtenerNombreEdificio = (idEdif) => {
    const edif = edificios.find(e => e.idEdif === parseInt(idEdif));
    return edif ? edif.nombreEdif : `Edificio ${idEdif}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validar que todos los campos estén completos
      if (!formData.annoMes || !formData.idEdif || !formData.nroDepto || !formData.monto) {
        throw new Error('Todos los campos son requeridos');
      }

      // Validar que el monto sea un número positivo
      const monto = parseFloat(formData.monto);
      if (isNaN(monto) || monto <= 0) {
        throw new Error('El monto debe ser un número positivo');
      }

      const resultado = await pagoService.registrarParcial({
        annoMes: parseInt(formData.annoMes),
        idEdif: parseInt(formData.idEdif),
        nroDepto: parseInt(formData.nroDepto),
        monto: monto,
      });

      const nombreEdificio = obtenerNombreEdificio(formData.idEdif);
      setSuccessMessage(
        `Pago registrado exitosamente. Período: ${formData.annoMes}, Edificio: ${nombreEdificio}, Depto: ${formData.nroDepto}, Monto: $${monto.toLocaleString('es-CL')}`
      );
      setSuccess(true);

      // Limpiar formulario
      setFormData({
        annoMes: new Date().toISOString().slice(0, 7).replace('-', ''),
        idEdif: '',
        nroDepto: '',
        monto: '',
      });
    } catch (err) {
      setError(err.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (loadingEdificios) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout
      title="Registro de Pagos"
      subtitle="Registrar pagos parciales de morosidades"
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-600 mb-6">
            Usa este formulario para registrar un pago parcial de una morosidad. El sistema actualizará automáticamente el monto adeudado.
          </p>

          {error && <ErrorAlert message={error} />}

          {success && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-green-800 mb-6">
              <p className="font-semibold">Éxito</p>
              <p className="text-sm mt-1">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Período (YYYYMM) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período (Año-Mes)
              </label>
              <input
                type="month"
                name="annoMes"
                value={formData.annoMes ? `${formData.annoMes.slice(0, 4)}-${formData.annoMes.slice(4)}` : ''}
                onChange={(e) => {
                  const monthValue = e.target.value.replace('-', '');
                  setFormData((prev) => ({
                    ...prev,
                    annoMes: monthValue,
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: Año-Mes (ej: 2024-12 para diciembre 2024)
              </p>
            </div>

            {/* Edificio con nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edificio
              </label>
              <select
                name="idEdif"
                value={formData.idEdif}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona un edificio</option>
                {edificios.map((edif) => (
                  <option key={edif.idEdif} value={edif.idEdif}>
                    {edif.nombreEdif} (ID: {edif.idEdif})
                  </option>
                ))}
              </select>
              {edificios.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No hay edificios disponibles</p>
              )}
            </div>

            {/* Número de Departamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Departamento
              </label>
              <input
                type="number"
                name="nroDepto"
                value={formData.nroDepto}
                onChange={handleInputChange}
                placeholder="Ej: 101"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Monto del Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto del Pago ($)
              </label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleInputChange}
                placeholder="Ej: 500000"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa el monto en pesos chilenos (sin separador de miles)
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Registrando...' : 'Registrar Pago'}
              </button>
              <button
                type="reset"
                className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                onClick={() => setFormData({
                  annoMes: new Date().toISOString().slice(0, 7).replace('-', ''),
                  idEdif: '',
                  nroDepto: '',
                  monto: '',
                })}
              >
                Limpiar
              </button>
            </div>
          </form>

          {/* Información útil */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
            <h3 className="font-semibold text-gray-900 mb-2">Información Importante</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>- Los pagos deben ser mayores a $0</li>
              <li>- Se aceptan pagos parciales de morosidades</li>
              <li>- El sistema actualizará automáticamente la deuda</li>
              <li>- Asegúrate de ingresar datos correctos antes de registrar</li>
              <li>- Puedes verificar los pagos registrados en la sección de Auditoría de Pagos</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default RegistroPagosPage;
