import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ReactNode, Suspense, lazy } from "react";
import LoadingSpinner from './components/LoadingSpinner';
import LandingPage from './pages/LandingPage';
import NotFound from './components/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthContext } from './context/AuthContext';
import { loadSupabase } from './lib/loadSupabase';
import { loadAppStrings } from './i18n';

// SignIn puxa @supabase/auth-ui-react (~5MB não empacotado) só para si —
// nenhum visitante de "/" deveria pagar esse custo antes de clicar em
// "Entrar". Todas as demais páginas ficam atrás de login (ou só chegam via
// link compartilhado) e também são carregadas sob demanda.
//
// Fora da landing, toda tela é sob demanda. As telas internas baixam junto
// (em paralelo, sem esperar uma pela outra) os textos que só elas usam; login
// e páginas legais usam só os arquivos principais. O login já puxa o cliente
// do Supabase.
const page = <T,>(load: () => Promise<T>) => () => Promise.all([load(), loadAppStrings()]).then(([m]) => m);
const SignIn = lazy(() => Promise.all([import('./pages/SignIn'), loadSupabase()]).then(([m]) => m));
const Layout = lazy(page(() => import('./components/Layout')));
const Home = lazy(page(() => import('./pages/Home')));
const SensoryProfileForm = lazy(page(() => import('./pages/SensoryProfile')));
const ReportPage = lazy(page(() => import('./pages/ReportPage')));
const AnamneseList = lazy(page(() => import('./pages/AnamneseList')));
const AnamneseForm = lazy(page(() => import('./pages/AnamneseForm')));
const AnamneseSharedView = lazy(page(() => import('./pages/AnamneseSharedView')));
const Children = lazy(page(() => import('./pages/Children')));
const ChildProfilePage = lazy(page(() => import('./pages/ChildProfilePage')));
const LogsPage = lazy(page(() => import('./pages/LogsPage')));
const DailyReportPage = lazy(page(() => import('./pages/DailyReportPage')));
const TherapyPage = lazy(page(() => import('./pages/TherapyPage')));
const MedicalPage = lazy(page(() => import('./pages/MedicalPage')));
const DevelopmentPage = lazy(page(() => import('./pages/DevelopmentPage')));
const EducationPage = lazy(page(() => import('./pages/EducationPage')));
const GoalsPage = lazy(page(() => import('./pages/GoalsPage')));
const GoalDetailPage = lazy(page(() => import('./pages/GoalDetailPage')));
const DocumentsPage = lazy(page(() => import('./pages/DocumentsPage')));
const MonthlyRecapPage = lazy(page(() => import('./pages/MonthlyRecapPage')));
const FichaCriancaPage = lazy(page(() => import('./pages/FichaCriancaPage')));
const SettingsPage = lazy(page(() => import('./pages/SettingsPage')));
const ShareChildPage = lazy(page(() => import('./pages/ShareChildPage')));
const CaregiversPage = lazy(page(() => import('./pages/CaregiversPage')));
const CaregiverInviteAcceptPage = lazy(page(() => import('./pages/CaregiverInviteAcceptPage')));
const CareTeamPage = lazy(page(() => import('./pages/CareTeamPage')));
const CareTeamChildrenPage = lazy(page(() => import('./pages/CareTeamChildrenPage')));
const CareTeamAcceptPage = lazy(page(() => import('./pages/CareTeamAcceptPage')));
const ClinicsPage = lazy(page(() => import('./pages/ClinicsPage')));
const ClinicAcceptPage = lazy(page(() => import('./pages/ClinicAcceptPage')));
const SharedChildrenList = lazy(page(() => import('./pages/SharedChildrenList')));
const SharedChildDetailPage = lazy(page(() => import('./pages/SharedChildDetailPage')));
const TeamNotesPage = lazy(page(() => import('./pages/TeamNotesPage')));
const AccessLogPage = lazy(page(() => import('./pages/AccessLogPage')));
const ConsolidatedReportPage = lazy(page(() => import('./pages/ConsolidatedReportPage')));
const ConsolidatedReportSharedView = lazy(page(() => import('./pages/ConsolidatedReportSharedView')));
const ProfessionalsList = lazy(page(() => import('./pages/ProfessionalsList')));
const ProfessionalForm = lazy(page(() => import('./pages/ProfessionalForm')));
const InviteAcceptPage = lazy(page(() => import('./pages/InviteAcceptPage')));
const SharedRecordsList = lazy(page(() => import('./pages/SharedRecordsList')));
const SharedAnamneseView = lazy(page(() => import('./pages/SharedAnamneseView')));
const SharedAssessmentView = lazy(page(() => import('./pages/SharedAssessmentView')));
const ConsentGate = lazy(page(() => import('./components/ConsentGate')));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoaded } = useAuthContext();
  const location = useLocation();

  if (!isLoaded) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><LoadingSpinner /></div>;
  if (!session) return <Navigate to="/sign-in" state={{ from: location }} replace />;
  return <ConsentGate>{children}</ConsentGate>;
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
            <Route path="/privacidade" element={<PrivacyPolicyPage />} />
            <Route path="/termos" element={<TermsOfServicePage />} />
            <Route path="/anamnese/shared/:token" element={<AnamneseSharedView />} />
            <Route path="/consolidated/shared/:token" element={<ConsolidatedReportSharedView />} />

            <Route path="/" element={<Layout />}>
              <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/assessments" element={<ProtectedRoute><Home /></ProtectedRoute>} />
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
              <Route path="/children/:childId/care-team" element={<ProtectedRoute><CareTeamPage /></ProtectedRoute>} />
              <Route path="/children/:childId/team-notes" element={<ProtectedRoute><TeamNotesPage /></ProtectedRoute>} />
              <Route path="/children/:childId/access-log" element={<ProtectedRoute><AccessLogPage /></ProtectedRoute>} />
              <Route path="/children/:childId/ficha" element={<ProtectedRoute><FichaCriancaPage /></ProtectedRoute>} />
              <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
              <Route path="/relato-do-dia" element={<ProtectedRoute><DailyReportPage /></ProtectedRoute>} />
              <Route path="/therapy" element={<ProtectedRoute><TherapyPage /></ProtectedRoute>} />
              <Route path="/medical" element={<ProtectedRoute><MedicalPage /></ProtectedRoute>} />
              <Route path="/development" element={<ProtectedRoute><DevelopmentPage /></ProtectedRoute>} />
              <Route path="/education" element={<ProtectedRoute><EducationPage /></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
              <Route path="/goals/:id" element={<ProtectedRoute><GoalDetailPage /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
              <Route path="/monthly-recap" element={<ProtectedRoute><MonthlyRecapPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/consolidated/:childId" element={<ProtectedRoute><ConsolidatedReportPage /></ProtectedRoute>} />

              {/* Professional directory (owner manages people who can be granted access) */}
              <Route path="/professionals" element={<ProtectedRoute><ProfessionalsList /></ProtectedRoute>} />
              <Route path="/professionals/new" element={<ProtectedRoute><ProfessionalForm /></ProtectedRoute>} />
              <Route path="/professionals/:id" element={<ProtectedRoute><ProfessionalForm /></ProtectedRoute>} />
              <Route path="/professionals/:id/edit" element={<ProtectedRoute><ProfessionalForm /></ProtectedRoute>} />

              {/* Invitation acceptance + professional read-only access */}
              <Route path="/invite/accept" element={<ProtectedRoute><InviteAcceptPage /></ProtectedRoute>} />
              <Route path="/caregiver-invite/accept" element={<ProtectedRoute><CaregiverInviteAcceptPage /></ProtectedRoute>} />
              <Route path="/care-team/accept" element={<ProtectedRoute><CareTeamAcceptPage /></ProtectedRoute>} />
              <Route path="/care-team/children" element={<ProtectedRoute><CareTeamChildrenPage /></ProtectedRoute>} />
              <Route path="/clinics" element={<ProtectedRoute><ClinicsPage /></ProtectedRoute>} />
              <Route path="/clinics/accept" element={<ProtectedRoute><ClinicAcceptPage /></ProtectedRoute>} />
              <Route path="/shared" element={<ProtectedRoute><SharedRecordsList /></ProtectedRoute>} />
              <Route path="/shared/anamnese/:id" element={<ProtectedRoute><SharedAnamneseView /></ProtectedRoute>} />
              <Route path="/shared/assessment/:id" element={<ProtectedRoute><SharedAssessmentView /></ProtectedRoute>} />
              <Route path="/shared/children" element={<ProtectedRoute><SharedChildrenList /></ProtectedRoute>} />
              <Route path="/shared/children/:childId" element={<ProtectedRoute><SharedChildDetailPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
