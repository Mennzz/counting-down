import { configureBoneyard } from "boneyard-js/react";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

configureBoneyard({
  animate: "shimmer",
  transition: true,
  color: "rgba(244, 63, 94, 0.14)",
  darkColor: "rgba(255, 255, 255, 0.12)"
});

createRoot(document.getElementById("root")!).render(<App />);
