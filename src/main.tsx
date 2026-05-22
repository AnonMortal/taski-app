import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { WalletProvider } from "./lib/wallet-context";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <WalletProvider>
    <App />
    <Toaster position="bottom-right" richColors />
  </WalletProvider>,
);
