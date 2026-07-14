import { createRoot } from "react-dom/client";
import { Component, type ReactNode, type ErrorInfo } from "react";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crash:", error, info);
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{ padding: 32, fontFamily: "monospace", background: "#1a1a1a", color: "#ff6b6b", minHeight: "100vh" }}>
          <h1 style={{ color: "#ff6b6b", marginBottom: 16 }}>Erro na renderização</h1>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#2a2a2a", padding: 16, borderRadius: 8 }}>
            {err.message}{"\n\n"}{err.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
