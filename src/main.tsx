import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { AuthProvider } from "./context/AuthContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Theme accentColor="teal" grayColor="sand" radius="large" scaling="100%">
    <AuthProvider>
      <App />
    </AuthProvider>
  </Theme>
);
