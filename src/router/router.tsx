import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import NotFound from '../pages/NotFound';
import Login from '../pages/Login';
import { Layout } from '@/components/Layout';
import ManageFiscalYear from '@/pages/fiscal_year/manage_fiscal_year';
import ProtectedRoute from '@/components/ProtectedRoute';
import ManageSectorPage from '@/pages/sectors/manageSectorPage';
import DataCategoriesPage from '@/pages/data_categories/dataCategoriesPage';
import OfficePage from '@/pages/offices/officePage';
import { ManageEconomicData } from '@/pages/economicData/manageEconomicDataPage';


const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Layout><Home /></Layout>,
      },
      {
        path: 'about',
        element: <Layout><About /></Layout>,
      },
      {
        path: 'fiscal-year',
        element: <Layout><ManageFiscalYear /></Layout>,
      },
      {
        path: 'sector',
        element: <Layout><ManageSectorPage /></Layout>,
      },
      {
        path: 'data-categories',
        element: <Layout><DataCategoriesPage /></Layout>,
      },
      {
        path: 'manage-offices',
        element: <Layout><OfficePage /></Layout>,
      },
      {
        path: 'manage-economic-data',
        element: <Layout><ManageEconomicData /></Layout>,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: <Login />,
      },
    ],
  }
]);

// Router component
export default function AppRouter() {
  return <RouterProvider router={router} />;
}


