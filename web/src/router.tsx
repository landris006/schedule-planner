import { Navigate, createBrowserRouter, redirect } from 'react-router-dom';
import Layout from '@/pages/layout';
import Courses from '@/pages/courses';
import Planner from '@/pages/planner';

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
      {
        path: '/planner',
        element: <Planner />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/courses" replace />,
  },
]);
