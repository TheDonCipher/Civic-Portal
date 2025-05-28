// vite.config.ts
import path from "path";
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.mjs";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // ✅ Vendor chunks for better caching
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "@radix-ui/react-toast",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-switch"
          ],
          "supabase-vendor": ["@supabase/supabase-js"],
          "query-vendor": ["@tanstack/react-query"],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          "chart-vendor": ["recharts"],
          "utils-vendor": ["clsx", "tailwind-merge", "date-fns"],
          "animation-vendor": ["framer-motion"],
          // ✅ Feature-based chunks (only existing components)
          "admin-features": [
            "./src/components/admin/AdminPage"
          ],
          "stakeholder-features": [
            "./src/components/stakeholder/StakeholderDashboard"
          ],
          // ✅ Performance optimization chunks
          "performance-vendor": [
            "./src/hooks/usePerformanceMonitor",
            "./src/hooks/useOptimizedSubscription",
            "./src/lib/utils/performanceMonitor"
          ]
        }
      }
    },
    // ✅ Optimize chunk size and enable source maps for debugging
    chunkSizeWarningLimit: 500,
    sourcemap: process.env.NODE_ENV === "development",
    // ✅ Enable minification and compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: process.env.NODE_ENV === "production"
      }
    },
    // ✅ Optimize asset handling
    assetsInlineLimit: 4096,
    // 4kb
    cssCodeSplit: true
  },
  // ✅ Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "@tanstack/react-query",
      "react-hook-form",
      "@hookform/resolvers/zod",
      "zod",
      "clsx",
      "tailwind-merge"
    ],
    exclude: ["@testing-library/react"]
  },
  // ✅ Enable CSS optimization
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  // ✅ Performance optimizations
  esbuild: {
    target: "es2020",
    logOverride: { "this-is-undefined-in-esm": "silent" }
  },
  // ✅ Preview server configuration
  preview: {
    port: 4173,
    host: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIGhvc3Q6IHRydWUsXG4gICAgb3BlbjogdHJ1ZSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgLy8gXHUyNzA1IFZlbmRvciBjaHVua3MgZm9yIGJldHRlciBjYWNoaW5nXG4gICAgICAgICAgJ3JlYWN0LXZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAndWktdmVuZG9yJzogW1xuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC10b2FzdCcsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRpYWxvZycsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLFxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC10YWJzJyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0JyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtY2hlY2tib3gnLFxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zd2l0Y2gnXG4gICAgICAgICAgXSxcbiAgICAgICAgICAnc3VwYWJhc2UtdmVuZG9yJzogWydAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXSxcbiAgICAgICAgICAncXVlcnktdmVuZG9yJzogWydAdGFuc3RhY2svcmVhY3QtcXVlcnknXSxcbiAgICAgICAgICAnZm9ybS12ZW5kb3InOiBbJ3JlYWN0LWhvb2stZm9ybScsICdAaG9va2Zvcm0vcmVzb2x2ZXJzJywgJ3pvZCddLFxuICAgICAgICAgICdjaGFydC12ZW5kb3InOiBbJ3JlY2hhcnRzJ10sXG4gICAgICAgICAgJ3V0aWxzLXZlbmRvcic6IFsnY2xzeCcsICd0YWlsd2luZC1tZXJnZScsICdkYXRlLWZucyddLFxuICAgICAgICAgICdhbmltYXRpb24tdmVuZG9yJzogWydmcmFtZXItbW90aW9uJ10sXG5cbiAgICAgICAgICAvLyBcdTI3MDUgRmVhdHVyZS1iYXNlZCBjaHVua3MgKG9ubHkgZXhpc3RpbmcgY29tcG9uZW50cylcbiAgICAgICAgICAnYWRtaW4tZmVhdHVyZXMnOiBbXG4gICAgICAgICAgICAnLi9zcmMvY29tcG9uZW50cy9hZG1pbi9BZG1pblBhZ2UnXG4gICAgICAgICAgXSxcbiAgICAgICAgICAnc3Rha2Vob2xkZXItZmVhdHVyZXMnOiBbXG4gICAgICAgICAgICAnLi9zcmMvY29tcG9uZW50cy9zdGFrZWhvbGRlci9TdGFrZWhvbGRlckRhc2hib2FyZCdcbiAgICAgICAgICBdLFxuICAgICAgICAgIC8vIFx1MjcwNSBQZXJmb3JtYW5jZSBvcHRpbWl6YXRpb24gY2h1bmtzXG4gICAgICAgICAgJ3BlcmZvcm1hbmNlLXZlbmRvcic6IFtcbiAgICAgICAgICAgICcuL3NyYy9ob29rcy91c2VQZXJmb3JtYW5jZU1vbml0b3InLFxuICAgICAgICAgICAgJy4vc3JjL2hvb2tzL3VzZU9wdGltaXplZFN1YnNjcmlwdGlvbicsXG4gICAgICAgICAgICAnLi9zcmMvbGliL3V0aWxzL3BlcmZvcm1hbmNlTW9uaXRvcidcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gXHUyNzA1IE9wdGltaXplIGNodW5rIHNpemUgYW5kIGVuYWJsZSBzb3VyY2UgbWFwcyBmb3IgZGVidWdnaW5nXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDAsXG4gICAgc291cmNlbWFwOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyxcbiAgICAvLyBcdTI3MDUgRW5hYmxlIG1pbmlmaWNhdGlvbiBhbmQgY29tcHJlc3Npb25cbiAgICBtaW5pZnk6ICd0ZXJzZXInLFxuICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgIGRyb3BfY29uc29sZTogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyxcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBcdTI3MDUgT3B0aW1pemUgYXNzZXQgaGFuZGxpbmdcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NiwgLy8gNGtiXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICB9LFxuICAvLyBcdTI3MDUgT3B0aW1pemUgZGVwZW5kZW5jaWVzXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFtcbiAgICAgICdyZWFjdCcsXG4gICAgICAncmVhY3QtZG9tJyxcbiAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcbiAgICAgICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnLFxuICAgICAgJ0B0YW5zdGFjay9yZWFjdC1xdWVyeScsXG4gICAgICAncmVhY3QtaG9vay1mb3JtJyxcbiAgICAgICdAaG9va2Zvcm0vcmVzb2x2ZXJzL3pvZCcsXG4gICAgICAnem9kJyxcbiAgICAgICdjbHN4JyxcbiAgICAgICd0YWlsd2luZC1tZXJnZSdcbiAgICBdLFxuICAgIGV4Y2x1ZGU6IFsnQHRlc3RpbmctbGlicmFyeS9yZWFjdCddXG4gIH0sXG4gIC8vIFx1MjcwNSBFbmFibGUgQ1NTIG9wdGltaXphdGlvblxuICBjc3M6IHtcbiAgICBkZXZTb3VyY2VtYXA6IHRydWUsXG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBhZGRpdGlvbmFsRGF0YTogYEBpbXBvcnQgXCJAL3N0eWxlcy92YXJpYWJsZXMuc2Nzc1wiO2BcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIC8vIFx1MjcwNSBQZXJmb3JtYW5jZSBvcHRpbWl6YXRpb25zXG4gIGVzYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgIGxvZ092ZXJyaWRlOiB7ICd0aGlzLWlzLXVuZGVmaW5lZC1pbi1lc20nOiAnc2lsZW50JyB9XG4gIH0sXG4gIC8vIFx1MjcwNSBQcmV2aWV3IHNlcnZlciBjb25maWd1cmF0aW9uXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiA0MTczLFxuICAgIGhvc3Q6IHRydWUsXG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixPQUFPLFVBQVU7QUFDMU8sU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBRmxCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsVUFDekQsYUFBYTtBQUFBLFlBQ1g7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsVUFDQSxtQkFBbUIsQ0FBQyx1QkFBdUI7QUFBQSxVQUMzQyxnQkFBZ0IsQ0FBQyx1QkFBdUI7QUFBQSxVQUN4QyxlQUFlLENBQUMsbUJBQW1CLHVCQUF1QixLQUFLO0FBQUEsVUFDL0QsZ0JBQWdCLENBQUMsVUFBVTtBQUFBLFVBQzNCLGdCQUFnQixDQUFDLFFBQVEsa0JBQWtCLFVBQVU7QUFBQSxVQUNyRCxvQkFBb0IsQ0FBQyxlQUFlO0FBQUE7QUFBQSxVQUdwQyxrQkFBa0I7QUFBQSxZQUNoQjtBQUFBLFVBQ0Y7QUFBQSxVQUNBLHdCQUF3QjtBQUFBLFlBQ3RCO0FBQUEsVUFDRjtBQUFBO0FBQUEsVUFFQSxzQkFBc0I7QUFBQSxZQUNwQjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSx1QkFBdUI7QUFBQSxJQUN2QixXQUFXLFFBQVEsSUFBSSxhQUFhO0FBQUE7QUFBQSxJQUVwQyxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjLFFBQVEsSUFBSSxhQUFhO0FBQUEsUUFDdkMsZUFBZSxRQUFRLElBQUksYUFBYTtBQUFBLE1BQzFDO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxtQkFBbUI7QUFBQTtBQUFBLElBQ25CLGNBQWM7QUFBQSxFQUNoQjtBQUFBO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyx3QkFBd0I7QUFBQSxFQUNwQztBQUFBO0FBQUEsRUFFQSxLQUFLO0FBQUEsSUFDSCxjQUFjO0FBQUEsSUFDZCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLGFBQWEsRUFBRSw0QkFBNEIsU0FBUztBQUFBLEVBQ3REO0FBQUE7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
