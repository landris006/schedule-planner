import { Navigate, createBrowserRouter, redirect } from 'react-router-dom';
import Layout from '@/pages/layout';
import SubjectsProvider from './contexts/subjects/subjects-provider';
import React from 'react';

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
        Component: React.lazy(() => import('./pages/subjects')),
      },
      {
        path: '/planner',
        Component: React.lazy(() => import('./pages/planner')),
      },
      {
        path: '/results',
        Component: React.lazy(() => import('./pages/results')),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/subjects" replace />,
  },
]);
