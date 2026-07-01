import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { OperationsPage } from './features/operations/OperationsPage';
import { ProvidersPage } from './features/providers/ProvidersPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { FinancePage } from './features/finance/FinancePage';
import { ReviewsPage } from './features/reviews/ReviewsPage';

export function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="operacoes" element={<OperationsPage />} />
        <Route path="prestadores" element={<ProvidersPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="financeiro" element={<FinancePage />} />
        <Route path="avaliacoes" element={<ReviewsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
