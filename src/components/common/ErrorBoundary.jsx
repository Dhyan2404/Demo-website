import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6 cyber-grid">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 to-gray-950/80 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white tracking-tight">Something went wrong</h2>
              <p className="text-xs text-gray-400">
                The application encountered an unexpected runtime state. Your local shop data is safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-gray-900/90 border border-white/10 text-left font-mono text-[11px] text-rose-300 break-words max-h-28 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-xl shadow-glow-green flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs rounded-xl transition-all"
              >
                Reset Local Storage Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
