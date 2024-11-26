import { Navigate, createBrowserRouter, redirect } from 'react-router-dom';
import Layout from '@/pages/layout';
import Subjects from '@/pages/subjects';
import Planner from '@/pages/planner';
import SubjectsProvider from './contexts/subjects/subjects-provider';
import Results from './pages/results';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <SubjectsProvider>
        <Layout />
      </SubjectsProvider>
    ),
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
      {
        path: '/results',
        element: <Results />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/subjects" replace />,
  },
]);
