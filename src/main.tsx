import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { AuthProvider } from "./context/AuthContext.tsx";
import { DelegationProvider } from "./context/DelegationContext.tsx";
import { ToastProvider } from "./context/ToastContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Theme accentColor="teal" grayColor="sand" radius="large" scaling="100%">
    <AuthProvider>
      <DelegationProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </DelegationProvider>
    </AuthProvider>
  </Theme>
);
