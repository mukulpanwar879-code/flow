"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div className="h-full flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
            <h3 className="text-sm font-semibold">Render failed</h3>
            <p className="text-xs text-muted-foreground break-words">
              {this.state.error.message || "An unexpected error occurred while rendering the diagram."}
            </p>
            <Button size="sm" variant="outline" onClick={this.reset} className="mt-2">
              <RefreshCw className="h-3 w-3 mr-1.5" /> Try again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
