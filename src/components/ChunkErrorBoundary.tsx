// src/components/ChunkErrorBoundary.tsx
//
// WHY THIS EXISTS:
// Routes are lazy-loaded (React.lazy), so each one is its own JS chunk with
// a content-hash filename. After a new deploy, old hashes no longer exist
// on the server. If a browser has a stale cached index.html/app.html (or
// just an open tab) referencing an old chunk, the dynamic import() throws
// — "Failed to fetch dynamically imported module" / "Loading chunk failed."
// That error can bubble up with an EMPTY <div id="root">, no visible
// error, and no console noise the user notices — exactly what happened
// with the Edge cache issue.
//
// This boundary catches that specific error class and force-reloads the
// page ONE time (tracked via sessionStorage so we never loop forever if
// the underlying deploy issue is real and reload doesn't fix it — after
// one retry it falls through to a visible, actionable error screen
// instead of silently reloading forever).

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
}

const RELOAD_FLAG_KEY = "chunk-error-reload-attempted";

function isChunkLoadError(error: Error): boolean {
  const msg = error.message || "";
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Loading chunk") ||
    msg.includes("Importing a module script failed") ||
    /Loading CSS chunk/.test(msg)
  );
}

class ChunkErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, isChunkError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, isChunkError: isChunkLoadError(error) };
  }

  componentDidCatch(error: Error) {
    if (isChunkLoadError(error)) {
      const alreadyTried = sessionStorage.getItem(RELOAD_FLAG_KEY);
      if (!alreadyTried) {
        sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
        // Force a real network reload (not from bfcache), bypassing the
        // cached shell that pointed at the now-missing chunk.
        window.location.reload();
      }
    }
  }

  componentDidMount() {
    // Clear the flag once we've mounted successfully, so a genuinely new
    // chunk error later (e.g. the NEXT deploy) gets its own fresh retry
    // instead of being silently swallowed forever by an old flag.
    sessionStorage.removeItem(RELOAD_FLAG_KEY);
  }

  render() {
    if (this.state.hasError) {
      const alreadyTried = sessionStorage.getItem(RELOAD_FLAG_KEY);

      // Mid-reload: render nothing (the reload is already in flight).
      if (this.state.isChunkError && !alreadyTried) {
        return null;
      }

      // Reload already attempted and it's STILL broken (or it's some
      // other render error) — show something visible and actionable
      // instead of a silent blank screen.
      return (
        <div className="bg-bgMain flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
          <p className="text-textMain text-lg font-bold">
            Something went wrong loading this page.
          </p>
          <p className="text-textDim max-w-sm text-sm">
            Please refresh the page. If this keeps happening, try clearing
            your browser cache for schooldra.com.
          </p>
          <button
            onClick={() => {
              sessionStorage.removeItem(RELOAD_FLAG_KEY);
              window.location.href = "/";
            }}
            className="bg-brand rounded-xl px-6 py-3 text-sm font-bold text-white"
          >
            Reload Schooldra
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;