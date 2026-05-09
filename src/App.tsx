import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import Layout from './components/Layout';
import Home from './pages/Home';
import SensoryProfileForm from './pages/SensoryProfile';
import ReportPage from './pages/ReportPage';
import AnamneseList from './pages/AnamneseList';
import AnamneseForm from './pages/AnamneseForm';
import AnamneseSharedView from './pages/AnamneseSharedView';
import SignIn from './pages/SignIn';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthContext } from './context/AuthContext';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoaded } = useAuthContext();
  const location = useLocation();

  if (!isLoaded) return null;
  if (!session) return <Navigate to="/sign-in" state={{ from: location }} replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/anamnese/shared/:token" element={<AnamneseSharedView />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/assessment/new" element={<ProtectedRoute><SensoryProfileForm /></ProtectedRoute>} />
            <Route path="/assessment/:id" element={<ProtectedRoute><SensoryProfileForm /></ProtectedRoute>} />
            <Route path="/assessment/:id/edit" element={<ProtectedRoute><SensoryProfileForm /></ProtectedRoute>} />
            <Route path="/assessment/:id/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
            <Route path="/anamneses" element={<ProtectedRoute><AnamneseList /></ProtectedRoute>} />
            <Route path="/anamnese/new" element={<ProtectedRoute><AnamneseForm /></ProtectedRoute>} />
            <Route path="/anamnese/:id" element={<ProtectedRoute><AnamneseForm /></ProtectedRoute>} />
            <Route path="/anamnese/:id/edit" element={<ProtectedRoute><AnamneseForm /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
