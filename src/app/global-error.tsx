"use client";

import { useEffect } from "react";

/**
 * The last line of defence: an error in the root layout itself.
 *
 * This component replaces the layout, so it renders its own html and body and
 * cannot assume the stylesheet, the fonts or the theme provider survived. Every
 * style here is inline for that reason, and the palette is hard-coded rather
 * than read from tokens that may never have been defined.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[portfolio] root fault:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#ffffff",
          color: "#14171a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "34rem",
            border: "1px solid #c9a227",
            padding: "2.5rem",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.625rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#7a5d0a",
            }}
          >
            Fault · E0
          </p>

          <h1
            style={{
              margin: "0.75rem 0 0",
              fontSize: "1.75rem",
              lineHeight: 1.1,
              fontWeight: 600,
            }}
          >
            The page could not load
          </h1>

          <p
            style={{
              margin: "1rem 0 0",
              fontSize: "0.9375rem",
              lineHeight: 1.7,
              color: "#3f464d",
            }}
          >
            Something failed before the site could render. Reloading usually
            clears it.
          </p>

          {error.digest ? (
            <p
              style={{
                margin: "1rem 0 0",
                fontSize: "0.6875rem",
                color: "#5a6068",
              }}
            >
              REF {error.digest}
            </p>
          ) : null}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.25rem",
              border: "1px solid #c9a227",
              background: "transparent",
              color: "#14171a",
              font: "inherit",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>

          <p
            style={{
              margin: "2rem 0 0",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(20,23,26,0.12)",
              fontSize: "0.8125rem",
              lineHeight: 1.7,
              color: "#5a6068",
            }}
          >
            Hans can be reached directly at{" "}
            <a href="mailto:hans.s.alcazar@gmail.com" style={{ color: "#3f464d" }}>
              hans.s.alcazar@gmail.com
            </a>
            .
          </p>
        </div>
      </body>
    </html>
  );
}
