import { Navigate, createBrowserRouter, redirect } from 'react-router-dom';
import Layout from '@/pages/layout';
import Subjects from '@/pages/subjects';
import Planner from '@/pages/planner';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        loader: () => redirect('/subjects'),
      },
      {
        path: '/subjects',
        element: <Subjects />,
      },
      {
        path: '/planner',
        element: <Planner />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/subjects" replace />,
  },
]);
