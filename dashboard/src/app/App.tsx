import { RouterProvider } from 'react-router';
import { AuthProvider } from './providers/AuthProvider';
import { DaemonProvider } from './providers/DaemonProvider';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <DaemonProvider>
        <RouterProvider router={router} />
      </DaemonProvider>
    </AuthProvider>
  );
}
