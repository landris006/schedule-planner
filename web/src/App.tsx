import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import LabelProvider from './contexts/label/label-provider';
import SubjectsProvider from './contexts/subjects/subjects-provider';

export default function App() {
  return (
    <LabelProvider>
      <SubjectsProvider>
        <RouterProvider router={router} />
      </SubjectsProvider>
    </LabelProvider>
  );
}
