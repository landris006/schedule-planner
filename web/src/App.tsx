import { NuqsAdapter } from 'nuqs/adapters/react-router';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import LabelProvider from './contexts/label/label-provider';

export default function App() {
  return (
    <LabelProvider>
      <NuqsAdapter>
        <RouterProvider router={router} />
      </NuqsAdapter>
    </LabelProvider>
  );
}
