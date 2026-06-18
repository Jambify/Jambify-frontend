import type {  ReactNode } from "react";
import  { Component,} from "react";
import { supabase } from "../../lib/supabase";

interface State {
  hasError: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
}

interface Props {
  children: ReactNode;
}

class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isRefreshing: false,
      errorMessage: null,
    };
  }

  static getDerivedStateFromError(error: any): Partial<State> {
    if (
      error?.code === "PGRST301" ||
      error?.status === 401 ||
      error?.status === 403
    ) {
      return {
        hasError: true,
        errorMessage: "Your session is expired, please refresh the page.",
      };
    }
    return { hasError: true, errorMessage: "Something went wrong." };
  }

  componentDidCatch(error: any) {
    console.error("🚨 AuthErrorBoundary caught:", error);
    
    this.setState({ isRefreshing: true });
    supabase.auth.refreshSession()
      .then(({ data, error }) => {
        if (!error && data.session) {
          console.log("✅ Token refreshed successfully, reloading...");
          window.location.reload();
        } else {
          console.error("❌ Token refresh failed:", error);
        }
      })
      .finally(() => {
        this.setState({ isRefreshing: false });
      });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-bgMain p-4">
          <div className="bg-bgCard border-borderMuted max-w-md rounded-2xl border p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-textMain">
              {this.state.isRefreshing ? "Refreshing Session..." : "Session Error"}
            </h1>
            <p className="mb-6 text-textDim">
              {this.state.errorMessage}
            </p>
            {!this.state.isRefreshing && (
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand/90"
              >
                Refresh Page
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AuthErrorBoundary;

