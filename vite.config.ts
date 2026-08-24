import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendProxyTarget =
    env.VITE_BACKEND_PROXY_TARGET ||
    "https://counting-down-fastapi-c061e3e79aa6.herokuapp.com";

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/health": {
          target: backendProxyTarget,
          changeOrigin: false,
        },
        "/api/v1": {
          target: backendProxyTarget,
          changeOrigin: false,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
