import { cookies } from 'next/headers';
import { LoginScreen } from './components/LoginScreen';
import { JobsDashboard } from './components/JobsDashboard';

export default async function JobsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  const isAuthenticated = !!token?.value;

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <JobsDashboard />;
}
