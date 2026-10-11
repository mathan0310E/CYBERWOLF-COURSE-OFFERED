import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ConsentProvider } from "./lib/consent";
import { LegalProvider } from "./lib/legal";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConsentProvider>
        <LegalProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LegalProvider>
      </ConsentProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
