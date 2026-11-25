import { configureBoneyard } from "boneyard-js/react";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if ("serviceWorker" in navigator) {
  void navigator.serviceWorker.register("/xiaobao-push-sw.js", { scope: "/" }).catch((error) => {
    // Push is an optional enhancement. Keep the authenticated inbox usable when a browser, network,
    // or stale deployment prevents worker registration.
    console.warn("Xiao Bao push service worker registration failed", error);
  });
}

configureBoneyard({
  animate: "shimmer",
  transition: true,
  color: "rgba(244, 63, 94, 0.14)",
  darkColor: "rgba(255, 255, 255, 0.12)"
});

createRoot(document.getElementById("root")!).render(<App />);
