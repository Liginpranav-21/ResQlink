import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <TopNav />
      <main className="ml-64 pt-16">
        <div className="px-6 pb-6 pt-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
