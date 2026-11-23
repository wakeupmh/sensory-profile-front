import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@radix-ui/themes/styles.css";
import "./i18n";
import { AuthProvider } from "./context/AuthContext.tsx";
import { DelegationProvider } from "./context/DelegationContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { ToastProvider } from "./context/ToastContext.tsx";
import { initErrorTracking } from "./lib/errorTracking";

initErrorTracking();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <DelegationProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </DelegationProvider>
    </AuthProvider>
  </ThemeProvider>
);
