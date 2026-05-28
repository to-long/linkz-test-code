import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import path from "node:path";

const { publicVars } = loadEnv({
  cwd: path.resolve(__dirname, "../.."),
  prefixes: ["PUBLIC_", "NEXT_PUBLIC_"],
});

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: { index: "./src/index.tsx" },
    define: publicVars,
  },
  server: {
    port: 3031,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:8081",
        ws: true,
      },
    },
  },
  html: {
    title: "Seat Reservation",
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    },
  },
});
