import { Navigate, createBrowserRouter, redirect } from 'react-router-dom';
import Layout from '@/pages/layout';
import Courses from './pages/courses';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        loader: () => redirect('/courses'),
      },
      {
        path: '/courses',
        element: <Courses />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/courses" replace />,
  },
]);
