import { NuqsAdapter } from 'nuqs/adapters/react-router';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import LabelProvider from './contexts/label/label-provider';
import { Suspense } from 'react';

export default function App() {
  return (
    <LabelProvider>
      <NuqsAdapter>
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </NuqsAdapter>
    </LabelProvider>
  );
}
