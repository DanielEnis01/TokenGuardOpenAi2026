import { RouterProvider } from 'react-router';
import { DaemonProvider } from './providers/DaemonProvider';
import { router } from './routes';

export default function App() {
  return (
    <DaemonProvider>
      <RouterProvider router={router} />
    </DaemonProvider>
  );
}
