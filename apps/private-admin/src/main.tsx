import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AdminAuthProvider } from "./lib/auth";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root was not found.");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AdminAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
