"use client";

// app/global-error.tsx
//
// The last boundary. It catches a failure in the root layout, which is the one
// place app/error.tsx cannot reach — and because the root layout is what
// failed, this file has to supply its own <html> and <body>.
//
// That also means none of the site's fonts or components are available here:
// globals.css is imported by the layout that did not render. So the styling is
// inline and deliberately plain. Nobody should ever see this page; if they do,
// the only job is to be legible and offer a link home rather than show the
// browser's raw error text.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#171717",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "460px" }}>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#737373",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            Island Hype
          </p>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "28px",
              lineHeight: 1.2,
              fontWeight: 600,
            }}
          >
            The site is temporarily unavailable.
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: "16px", lineHeight: 1.55, color: "#404040" }}>
            We&rsquo;re aware of it and it should be brief. To enquire about a
            trip in the meantime, email{" "}
            <a href="mailto:info@islandhypemaldives.com" style={{ color: "#171717" }}>
              info@islandhypemaldives.com
            </a>
            .
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: "8px",
              background: "#171717",
              color: "#ffffff",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p
              style={{
                margin: "28px 0 0",
                fontSize: "12px",
                color: "#737373",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
