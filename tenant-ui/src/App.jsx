import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TenantsPage from './pages/TenantsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tenants" element={<TenantsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
