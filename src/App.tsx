import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ReactNode, Suspense, lazy } from "react";
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthContext } from './context/AuthContext';

// SignIn puxa @supabase/auth-ui-react (~5MB não empacotado) só para si —
// nenhum visitante de "/" deveria pagar esse custo antes de clicar em
// "Entrar". Todas as demais páginas ficam atrás de login (ou só chegam via
// link compartilhado) e também são carregadas sob demanda.
const SignIn = lazy(() => import('./pages/SignIn'));
const Home = lazy(() => import('./pages/Home'));
const SensoryProfileForm = lazy(() => import('./pages/SensoryProfile'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const AnamneseList = lazy(() => import('./pages/AnamneseList'));
const AnamneseForm = lazy(() => import('./pages/AnamneseForm'));
const AnamneseSharedView = lazy(() => import('./pages/AnamneseSharedView'));
const Children = lazy(() => import('./pages/Children'));
const ChildProfilePage = lazy(() => import('./pages/ChildProfilePage'));
const LogsPage = lazy(() => import('./pages/LogsPage'));
const TherapyPage = lazy(() => import('./pages/TherapyPage'));
const MedicalPage = lazy(() => import('./pages/MedicalPage'));
const DevelopmentPage = lazy(() => import('./pages/DevelopmentPage'));
const EducationPage = lazy(() => import('./pages/EducationPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const GoalDetailPage = lazy(() => import('./pages/GoalDetailPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const MonthlyRecapPage = lazy(() => import('./pages/MonthlyRecapPage'));
const FichaCriancaPage = lazy(() => import('./pages/FichaCriancaPage'));
const ShareChildPage = lazy(() => import('./pages/ShareChildPage'));
const CaregiversPage = lazy(() => import('./pages/CaregiversPage'));
const CaregiverInviteAcceptPage = lazy(() => import('./pages/CaregiverInviteAcceptPage'));
const SharedChildrenList = lazy(() => import('./pages/SharedChildrenList'));
const SharedChildDetailPage = lazy(() => import('./pages/SharedChildDetailPage'));
const TeamNotesPage = lazy(() => import('./pages/TeamNotesPage'));
const AccessLogPage = lazy(() => import('./pages/AccessLogPage'));
const ConsolidatedReportPage = lazy(() => import('./pages/ConsolidatedReportPage'));
const ConsolidatedReportSharedView = lazy(() => import('./pages/ConsolidatedReportSharedView'));
const ProfessionalsList = lazy(() => import('./pages/ProfessionalsList'));
const ProfessionalForm = lazy(() => import('./pages/ProfessionalForm'));
const InviteAcceptPage = lazy(() => import('./pages/InviteAcceptPage'));
const SharedRecordsList = lazy(() => import('./pages/SharedRecordsList'));
const SharedAnamneseView = lazy(() => import('./pages/SharedAnamneseView'));
const SharedAssessmentView = lazy(() => import('./pages/SharedAssessmentView'));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoaded } = useAuthContext();
  const location = useLocation();

  if (!isLoaded) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><LoadingSpinner /></div>;
  if (!session) return <Navigate to="/sign-in" state={{ from: location }} replace />;
  return <>{children}</>;
}

const RouteFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <LoadingSpinner />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
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
              <Route path="/children/:childId/share" element={<ProtectedRoute><ShareChildPage /></ProtectedRoute>} />
              <Route path="/children/:childId/caregivers" element={<ProtectedRoute><CaregiversPage /></ProtectedRoute>} />
              <Route path="/children/:childId/team-notes" element={<ProtectedRoute><TeamNotesPage /></ProtectedRoute>} />
              <Route path="/children/:childId/access-log" element={<ProtectedRoute><AccessLogPage /></ProtectedRoute>} />
              <Route path="/children/:childId/ficha" element={<ProtectedRoute><FichaCriancaPage /></ProtectedRoute>} />
              <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
              <Route path="/therapy" element={<ProtectedRoute><TherapyPage /></ProtectedRoute>} />
              <Route path="/medical" element={<ProtectedRoute><MedicalPage /></ProtectedRoute>} />
              <Route path="/development" element={<ProtectedRoute><DevelopmentPage /></ProtectedRoute>} />
              <Route path="/education" element={<ProtectedRoute><EducationPage /></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
              <Route path="/goals/:id" element={<ProtectedRoute><GoalDetailPage /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
              <Route path="/monthly-recap" element={<ProtectedRoute><MonthlyRecapPage /></ProtectedRoute>} />
              <Route path="/consolidated/:childId" element={<ProtectedRoute><ConsolidatedReportPage /></ProtectedRoute>} />

              {/* Professional directory (owner manages people who can be granted access) */}
              <Route path="/professionals" element={<ProtectedRoute><ProfessionalsList /></ProtectedRoute>} />
              <Route path="/professionals/new" element={<ProtectedRoute><ProfessionalForm /></ProtectedRoute>} />
              <Route path="/professionals/:id" element={<ProtectedRoute><ProfessionalForm /></ProtectedRoute>} />
              <Route path="/professionals/:id/edit" element={<ProtectedRoute><ProfessionalForm /></ProtectedRoute>} />

              {/* Invitation acceptance + professional read-only access */}
              <Route path="/invite/accept" element={<ProtectedRoute><InviteAcceptPage /></ProtectedRoute>} />
              <Route path="/caregiver-invite/accept" element={<ProtectedRoute><CaregiverInviteAcceptPage /></ProtectedRoute>} />
              <Route path="/shared" element={<ProtectedRoute><SharedRecordsList /></ProtectedRoute>} />
              <Route path="/shared/anamnese/:id" element={<ProtectedRoute><SharedAnamneseView /></ProtectedRoute>} />
              <Route path="/shared/assessment/:id" element={<ProtectedRoute><SharedAssessmentView /></ProtectedRoute>} />
              <Route path="/shared/children" element={<ProtectedRoute><SharedChildrenList /></ProtectedRoute>} />
              <Route path="/shared/children/:childId" element={<ProtectedRoute><SharedChildDetailPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
