import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Development talks to a local backend unless another one is chosen explicitly, so local
  // work never reaches production data by default.
  const backendProxyTarget =
    env.VITE_BACKEND_PROXY_TARGET || "http://localhost:8000";

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
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
