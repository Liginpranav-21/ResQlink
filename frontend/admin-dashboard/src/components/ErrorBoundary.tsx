import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  info: ErrorInfo | null;
}

/**
 * ErrorBoundary — catches render-time errors anywhere below it in the tree.
 *
 * WHY THIS WAS MISSING / WHY IT MATTERS:
 * Previously, NOTHING in this app caught render errors. In React 18, an
 * uncaught error thrown during render causes React to unmount the entire
 * root — the screen goes completely blank (just the slate-950 body
 * background, i.e. solid black).
 *
 * If something afterwards triggers a state update (e.g. the
 * onAuthStateChanged listener in useAuth firing again, a Firebase RTDB
 * snapshot callback, a toast, a timer, etc.), React attempts to re-render
 * from the root. If the SAME error happens again on that re-render, the
 * tree is unmounted again — and so on, forever. From the outside this looks
 * exactly like what was seen in the video: the "Initializing ResQLink…"
 * screen flashes briefly, the page goes solid black, then flashes again,
 * repeating in an endless loop, with no error ever visible to the user.
 *
 * This boundary stops that loop: once an error is caught, React stops
 * re-rendering the crashed subtree and instead renders this static fallback
 * UI. The actual error message + component stack are shown, which makes the
 * real underlying bug visible (in the UI and in the console) instead of an
 * invisible, silent, infinite crash loop.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, info: null };

  static getDerivedStateFromError(error: Error) {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught render error:', error, info);
    this.setState({ info });
  }

  // React calls componentDidCatch with a slightly different name in some
  // versions; keep the standard lifecycle too for safety.
  componentDidCatchLegacy = this.componentDidCatch;

  handleReload = () => {
    // Clear any potentially-corrupt persisted auth state before reloading,
    // in case the crash is caused by a bad cached value.
    try {
      localStorage.removeItem('resqlink-auth-admin');
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    const { error, info } = this.state;

    if (error) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white text-xl font-bold">!</div>
              <div>
                <h1 className="text-white text-lg font-semibold">ResQLink hit an error while loading</h1>
                <p className="text-slate-400 text-sm">The app crashed during render. Details below.</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4 overflow-auto max-h-64">
              <p className="text-red-400 text-sm font-mono mb-2">{error.name}: {error.message}</p>
              {error.stack && (
                <pre className="text-slate-500 text-xs whitespace-pre-wrap">{error.stack}</pre>
              )}
              {info?.componentStack && (
                <pre className="text-slate-600 text-xs whitespace-pre-wrap mt-2">{info.componentStack}</pre>
              )}
            </div>

            <button
              onClick={this.handleReload}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              Clear cached session &amp; reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
