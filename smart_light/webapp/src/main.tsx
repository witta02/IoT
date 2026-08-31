import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { registerSW } from 'virtual:pwa-register';

// Auto-register offline Service Worker
registerSW({ immediate: true });

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React UI Error Caught]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080a] text-[#fcfbfa] flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-[#0e1117] border border-[#222834] rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>

            <h2 className="text-base font-bold text-[#fcfbfa] mb-1">
              เกิดข้อผิดพลาดในการแสดงผล
            </h2>
            <p className="text-xs text-[#8b95a5] mb-4">
              {this.state.error?.message || 'ไม่สามารถโหลดส่วนติดต่อผู้ใช้ได้'}
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-[#d4af37] hover:bg-[#c49f27] text-[#07080a] font-bold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              โหลดหน้าเว็บใหม่
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
);

