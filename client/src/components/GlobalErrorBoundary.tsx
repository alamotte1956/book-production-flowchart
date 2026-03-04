/**
 * GlobalErrorBoundary
 *
 * Catches any unhandled React render errors and:
 *   1. Logs the full error + component stack to the browser console
 *   2. Shows a user-friendly fallback UI with a copy-to-clipboard error report
 *   3. Provides a "Reload page" button to recover
 *
 * Mount once at the root of the app (in main.tsx or App.tsx).
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, Copy, RefreshCw, Check } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log full diagnostic to the browser console so DevTools shows the complete trace
    console.group("%c[GlobalErrorBoundary] Unhandled React Error", "color: #dc2626; font-weight: bold;");
    console.error("Error:", error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("Digest:", (errorInfo as { digest?: string }).digest ?? "N/A");
    console.groupEnd();
  }

  private buildReport(): string {
    const { error, errorInfo } = this.state;
    return JSON.stringify(
      {
        context: "GlobalErrorBoundary",
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        message: error?.message ?? "Unknown error",
        stack: error?.stack ?? null,
        componentStack: errorInfo?.componentStack ?? null,
      },
      null,
      2
    );
  }

  private handleCopy = async () => {
    const report = this.buildReport();
    try {
      await navigator.clipboard.writeText(report);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = report;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, errorInfo, copied } = this.state;

    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-xl border border-red-200 bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border-b border-red-200">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">Something went wrong</p>
              <p className="text-xs text-red-600 mt-0.5">
                An unexpected error occurred in the application.
              </p>
            </div>
          </div>

          {/* Error message */}
          <div className="px-6 py-4">
            {error?.message && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 mb-4">
                <p className="text-xs font-mono text-red-800 break-words whitespace-pre-wrap">
                  {error.message}
                </p>
              </div>
            )}

            <p className="text-sm text-[#5c3d2e] mb-4">
              Please copy the error report below and share it to help diagnose the issue. Then reload the page to continue.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={this.handleCopy}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 transition-colors"
              >
                {copied ? (
                  <><Check className="w-4 h-4" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Error Report</>
                )}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-md border border-[#c9a96e] text-[#5c3d2e] hover:bg-[#faf6ef] text-sm px-4 py-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
            </div>
          </div>

          {/* Expandable component stack */}
          {errorInfo?.componentStack && (
            <details className="border-t border-red-100">
              <summary className="px-6 py-3 text-xs text-red-600 cursor-pointer hover:bg-red-50 select-none">
                Show component stack (for developers)
              </summary>
              <div className="px-6 pb-4">
                <pre className="text-[10px] font-mono text-red-700 whitespace-pre-wrap break-all max-h-48 overflow-y-auto bg-red-50 rounded border border-red-200 p-3">
                  {errorInfo.componentStack}
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }
}
