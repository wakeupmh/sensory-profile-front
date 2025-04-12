import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Layout from './components/Layout';
import Home from './pages/Home';
import SensoryProfileForm from './pages/SensoryProfile';
import ReportPage from './pages/ReportPage';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<Home />} />
            
            {/* Protected routes */}
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
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
