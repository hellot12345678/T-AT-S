import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[400px] p-6 flex flex-col items-center justify-center text-center bg-[#FAF9F6] rounded-3xl border border-[#FFE6DC] m-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">error_outline</span>
          </div>
          <h2 className="font-['Outfit'] text-xl font-bold text-[#1D1A23] mb-2">
            {this.props.fallbackTitle || 'Component Rendering Error'}
          </h2>
          <p className="text-xs text-[#57423D] max-w-md mb-4 leading-relaxed">
            {this.state.error?.message || 'An unexpected rendering error occurred in this section.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#FFE6DC] text-[#1D1A23] text-xs font-bold border border-[#FFE6DC] transition-all"
            >
              Try Re-rendering
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-[#A53B22] hover:bg-[#84240D] text-white text-xs font-bold transition-all shadow-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

