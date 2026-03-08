import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import "./index.css";

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  console.group("%c[Unhandled Promise Rejection]", "color: #dc2626; font-weight: bold;");
  console.error("Reason:", reason);
  if (reason instanceof Error) {
    console.error("Message:", reason.message);
    console.error("Stack:", reason.stack);
  }
  console.groupEnd();
});

window.addEventListener("error", (event) => {
  console.group("%c[Uncaught Error]", "color: #dc2626; font-weight: bold;");
  console.error("Message:", event.message);
  console.error("Source:", `${event.filename}:${event.lineno}:${event.colno}`);
  if (event.error) console.error("Error object:", event.error);
  console.groupEnd();
});

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  console.warn("Auth error:", error.message);
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </GlobalErrorBoundary>
);
