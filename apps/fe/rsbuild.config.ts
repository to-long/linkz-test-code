import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: { index: "./src/index.tsx" },
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
