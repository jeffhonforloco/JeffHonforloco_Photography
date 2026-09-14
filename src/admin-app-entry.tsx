import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Admin from '@/pages/Admin';

const AdminApp = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <Admin />
    </BrowserRouter>
  </ErrorBoundary>
);

export default AdminApp;
