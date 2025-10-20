import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TenantsPage from './pages/TenantsPage';
import FlowPage from './pages/FlowPage';
import MorosidadPage from './pages/MorosidadPage';
import EdificiosPage from './pages/EdificiosPage';
import AuditoriaMorosidadPage from './pages/AuditoriaMorosidadPage';
import AuditoriaPagosPage from './pages/AuditoriaPagosPage';
import RegistroPagosPage from './pages/RegistroPagosPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/morosidad" element={<MorosidadPage />} />
        <Route path="/edificios" element={<EdificiosPage />} />
        <Route path="/auditoria-morosidad" element={<AuditoriaMorosidadPage />} />
        <Route path="/auditoria-pagos" element={<AuditoriaPagosPage />} />
        <Route path="/registro-pagos" element={<RegistroPagosPage />} />
        <Route path="/flow" element={<FlowPage />} />
      </Routes>
    </BrowserRouter>
  );
}
