import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import LabelProvider from './contexts/label/label-provider';

export default function App() {
  return (
    <LabelProvider>
      <RouterProvider router={router} />
    </LabelProvider>
  );
}
