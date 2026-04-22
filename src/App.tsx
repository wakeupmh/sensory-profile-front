import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Layout from './components/Layout';
import Home from './pages/Home';
import SensoryProfileForm from './pages/SensoryProfile';
import ReportPage from './pages/ReportPage';
import AnamneseList from './pages/AnamneseList';
import AnamneseForm from './pages/AnamneseForm';
import AnamneseSharedView from './pages/AnamneseSharedView';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public shared anamnese route — outside Layout, no auth */}
          <Route path="/anamnese/shared/:token" element={<AnamneseSharedView />} />

          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<Home />} />

            {/* Protected assessment routes */}
            <Route
              path="/assessment/new"
              element={
                <>
                  <SignedIn>
                    <SensoryProfileForm />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            <Route
              path="/assessment/:id"
              element={
                <>
                  <SignedIn>
                    <SensoryProfileForm />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            <Route
              path="/assessment/:id/edit"
              element={
                <>
                  <SignedIn>
                    <SensoryProfileForm />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            <Route
              path="/assessment/:id/report"
              element={
                <>
                  <SignedIn>
                    <ReportPage />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            {/* Protected anamnese routes */}
            <Route
              path="/anamneses"
              element={
                <>
                  <SignedIn>
                    <AnamneseList />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            <Route
              path="/anamnese/new"
              element={
                <>
                  <SignedIn>
                    <AnamneseForm />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            <Route
              path="/anamnese/:id"
              element={
                <>
                  <SignedIn>
                    <AnamneseForm />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            <Route
              path="/anamnese/:id/edit"
              element={
                <>
                  <SignedIn>
                    <AnamneseForm />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
