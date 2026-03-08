/**
 * ErrorDetail — Reusable error display component
 *
 * Shows a structured error card with:
 *   - Human-readable title and message
 *   - Error code / HTTP status (when available from tRPC)
 *   - Expandable raw JSON section for full diagnostic details
 *   - One-click "Copy error report" button for easy bug reporting
 *
 * Usage:
 *   <ErrorDetail error={error} context="ISBN Lookup" />
 */

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { TRPCClientError } from "@trpc/client";

interface ErrorDetailProps {
  /** The error object — can be a TRPCClientError, a plain Error, or any unknown value */
  error: unknown;
  /** Optional context label shown in the header (e.g. "ISBN Lookup", "Auto-Produce") */
  context?: string;
  /** Optional CSS class applied to the outer wrapper */
  className?: string;
}

function extractErrorInfo(error: unknown): {
  title: string;
  message: string;
  code?: string;
  httpStatus?: number;
  shape?: unknown;
  stack?: string;
} {
  if (error instanceof TRPCClientError) {
    const code = error.data?.code as string | undefined;
    const httpStatus = error.data?.httpStatus as number | undefined;
    const shape = error.shape ?? error.data;
    return {
      title: codeToTitle(code ?? "ERROR"),
      message: error.message || "An unexpected error occurred.",
      code,
      httpStatus,
      shape,
      stack: error.stack,
    };
  }
  if (error instanceof Error) {
    return {
      title: "Error",
      message: error.message || "An unexpected error occurred.",
      stack: error.stack,
    };
  }
  return {
    title: "Unknown Error",
    message: String(error),
  };
}

function codeToTitle(code: string): string {
  const map: Record<string, string> = {
    BAD_REQUEST: "Invalid Request",
    NOT_FOUND: "Not Found",
    UNAUTHORIZED: "Authentication Required",
    FORBIDDEN: "Access Denied",
    TIMEOUT: "Request Timed Out",
    INTERNAL_SERVER_ERROR: "Server Error",
    TOO_MANY_REQUESTS: "Too Many Requests",
    PARSE_ERROR: "Parse Error",
    CONFLICT: "Conflict",
    PRECONDITION_FAILED: "Precondition Failed",
    UNPROCESSABLE_CONTENT: "Unprocessable Content",
    METHOD_NOT_SUPPORTED: "Method Not Supported",
    CLIENT_CLOSED_REQUEST: "Request Cancelled",
  };
  return map[code] ?? code.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function suggestFix(code?: string, message?: string): string | null {
  const msg = (message ?? "").toLowerCase();
  if (code === "BAD_REQUEST" || msg.includes("invalid isbn")) {
    return "Check that the ISBN is 10 or 13 digits with no extra characters.";
  }
  if (code === "NOT_FOUND" || msg.includes("no book found")) {
    return "This ISBN was not found in Open Library or Google Books. Try an alternate edition or verify the number.";
  }
  if (code === "UNAUTHORIZED") {
    return "An authentication error occurred. Please refresh the page and try again.";
  }
  if (code === "TIMEOUT" || msg.includes("timeout") || msg.includes("timed out")) {
    return "The external book database took too long to respond. Please wait a moment and try again.";
  }
  if (code === "INTERNAL_SERVER_ERROR" || msg.includes("pipeline") || msg.includes("typeset")) {
    return "A server-side error occurred. Copy the error report below and share it to get help diagnosing the issue.";
  }
  if (msg.includes("unsupported") || msg.includes("format")) {
    return "The file format is not supported. Try converting to .docx or .txt before uploading.";
  }
  if (msg.includes("empty") || msg.includes("no text") || msg.includes("no content")) {
    return "No readable text was found in the file. Make sure the document contains actual text (not just images or scanned pages).";
  }
  return null;
}

export function ErrorDetail({ error, context, className = "" }: ErrorDetailProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { title, message, code, httpStatus, shape, stack } = extractErrorInfo(error);
  const fix = suggestFix(code, message);

  const reportText = JSON.stringify(
    {
      context: context ?? "unknown",
      timestamp: new Date().toISOString(),
      errorCode: code,
      httpStatus,
      message,
      details: shape,
      stack,
    },
    null,
    2
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select a hidden textarea
      const ta = document.createElement("textarea");
      ta.value = reportText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 overflow-hidden ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800">
            {context ? `${context}: ` : ""}{title}
            {(code || httpStatus) && (
              <span className="ml-2 font-mono text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                {code ?? ""}{httpStatus ? ` (HTTP ${httpStatus})` : ""}
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-red-700 break-words">{message}</p>
          {fix && (
            <p className="mt-2 text-xs text-red-600 bg-red-100 rounded px-2 py-1.5 border border-red-200">
              <span className="font-semibold">Suggested fix: </span>{fix}
            </p>
          )}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 px-4 pb-2 border-t border-red-100 pt-2">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 transition-colors"
          title="Copy full error report to clipboard"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5" /> Copied!</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copy error report</>
          )}
        </button>
        {(shape || stack) && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors ml-auto"
          >
            {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Hide details</> : <><ChevronDown className="w-3.5 h-3.5" /> Show details</>}
          </button>
        )}
      </div>

      {/* Expandable raw details */}
      {expanded && (shape || stack) && (
        <div className="border-t border-red-100 bg-red-50/80 px-4 py-3">
          <pre className="text-[10px] font-mono text-red-700 whitespace-pre-wrap break-all max-h-64 overflow-y-auto leading-relaxed">
            {reportText}
          </pre>
        </div>
      )}
    </div>
  );
}
