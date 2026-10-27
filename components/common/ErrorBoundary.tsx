"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { WarningAmberRounded, RefreshRounded } from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Component boundary caught exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] text-center my-4 animate-in fade-in">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FFEDD5] text-[#EA580C] mb-2">
            <WarningAmberRounded sx={{ fontSize: 22 }} />
          </div>
          <h3 className="text-sm font-bold text-[#334155]">
            {this.props.fallbackTitle || "View could not be loaded"}
          </h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
            {this.state.error?.message || "An error occurred rendering this section."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF9933] text-white text-xs font-bold hover:bg-[#E88520] transition-colors cursor-pointer"
          >
            <RefreshRounded sx={{ fontSize: 16 }} />
            <span>Retry Section</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;
