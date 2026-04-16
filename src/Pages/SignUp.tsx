import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../Store/UseUserStore";
import Button from "../components/ui/Button";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setEmailStore = useUserStore((s) => s.setEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Store email and proceed to onboarding
    setEmailStore(email);
    navigate("/onboarding");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to JAMBify</h2>
            <p className="text-gray-600">Setting up your personalized learning experience...</p>
          </div>
          
          {/* Skeleton loader elements */}
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded-full w-3/4 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded-full w-1/2 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded-full w-2/3 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">J</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join JAMBify</h1>
          <p className="text-gray-600">Start your JAMB preparation journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
              placeholder="Enter your email"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition duration-200"
            disabled={!email}
          >
            Get Started
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              Sign In
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Help</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
