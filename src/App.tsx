import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import SensoryProfileForm from './pages/SensoryProfile';
import ReportPage from './pages/ReportPage';
import AnamneseList from './pages/AnamneseList';
import AnamneseForm from './pages/AnamneseForm';
import AnamneseSharedView from './pages/AnamneseSharedView';
import Children from './pages/Children';
import ChildProfilePage from './pages/ChildProfilePage';
import LogsPage from './pages/LogsPage';
import TherapyPage from './pages/TherapyPage';
import MedicalPage from './pages/MedicalPage';
import DevelopmentPage from './pages/DevelopmentPage';
import EducationPage from './pages/EducationPage';
import ConsolidatedReportPage from './pages/ConsolidatedReportPage';
import ConsolidatedReportSharedView from './pages/ConsolidatedReportSharedView';
import ProfessionalsList from './pages/ProfessionalsList';
import ProfessionalForm from './pages/ProfessionalForm';
import InviteAcceptPage from './pages/InviteAcceptPage';
import SharedRecordsList from './pages/SharedRecordsList';
import SharedAnamneseView from './pages/SharedAnamneseView';
import SharedAssessmentView from './pages/SharedAssessmentView';
import SignIn from './pages/SignIn';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthContext } from './context/AuthContext';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoaded } = useAuthContext();
  const location = useLocation();

  if (!isLoaded) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><LoadingSpinner /></div>;
  if (!session) return <Navigate to="/sign-in" state={{ from: location }} replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/anamnese/shared/:token" element={<AnamneseSharedView />} />
          <Route path="/consolidated/shared/:token" element={<ConsolidatedReportSharedView />} />

          <Route path="/" element={<Layout />}>
            <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/assessment/new" element={<ProtectedRoute><SensoryProfileForm /></ProtectedRoute>} />
            <Route path="/assessment/:id" element={<ProtectedRoute><SensoryProfileForm /></ProtectedRoute>} />
            <Route path="/assessment/:id/edit" element={<ProtectedRoute><SensoryProfileForm /></ProtectedRoute>} />
            <Route path="/assessment/:id/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
            <Route path="/anamneses" element={<ProtectedRoute><AnamneseList /></ProtectedRoute>} />
            <Route path="/anamnese/new" element={<ProtectedRoute><AnamneseForm /></ProtectedRoute>} />
            <Route path="/anamnese/:id" element={<ProtectedRoute><AnamneseForm /></ProtectedRoute>} />
            <Route path="/anamnese/:id/edit" element={<ProtectedRoute><AnamneseForm /></ProtectedRoute>} />
            <Route path="/children" element={<ProtectedRoute><Children /></ProtectedRoute>} />
            <Route path="/children/:childId" element={<ProtectedRoute><ChildProfilePage /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
            <Route path="/therapy" element={<ProtectedRoute><TherapyPage /></ProtectedRoute>} />
            <Route path="/medical" element={<ProtectedRoute><MedicalPage /></ProtectedRoute>} />
            <Route path="/development" element={<ProtectedRoute><DevelopmentPage /></ProtectedRoute>} />
            <Route path="/education" element={<ProtectedRoute><EducationPage /></ProtectedRoute>} />
            <Route path="/consolidated/:childId" element={<ProtectedRoute><ConsolidatedReportPage /></ProtectedRoute>} />

            {/* Professional directory (owner manages people who can be granted access) */}
            <Route path="/professionals" element={<ProtectedRoute><ProfessionalsList /></ProtectedRoute>} />
            <Route path="/professionals/new" element={<ProtectedRoute><ProfessionalForm /></ProtectedRoute>} />
            <Route path="/professionals/:id" element={<ProtectedRoute><ProfessionalForm /></ProtectedRoute>} />
            <Route path="/professionals/:id/edit" element={<ProtectedRoute><ProfessionalForm /></ProtectedRoute>} />

            {/* Invitation acceptance + professional read-only access */}
            <Route path="/invite/accept" element={<ProtectedRoute><InviteAcceptPage /></ProtectedRoute>} />
            <Route path="/shared" element={<ProtectedRoute><SharedRecordsList /></ProtectedRoute>} />
            <Route path="/shared/anamnese/:id" element={<ProtectedRoute><SharedAnamneseView /></ProtectedRoute>} />
            <Route path="/shared/assessment/:id" element={<ProtectedRoute><SharedAssessmentView /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
