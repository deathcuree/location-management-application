import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import MapPage from './pages/MapPage';
import UploadPage from './pages/UploadPage';
import Toasts from './components/Toasts';
import { useAuthStore } from './store/auth';

function IndexRedirect() {
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  return <Navigate to={isAuthed ? '/map' : '/login'} replace />;
}

export default function App() {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6">
          <Routes>
            <Route path="/" element={<IndexRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <Toasts />
    </div>
  );
}
