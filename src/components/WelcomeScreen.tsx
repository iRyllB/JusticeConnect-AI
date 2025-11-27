import React from 'react';
import { Scale } from 'lucide-react';

interface WelcomeScreenProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onContinueAsGuest: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLoginClick, onSignUpClick, onContinueAsGuest }) => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white w-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Scale className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Ready to Connect?</h1>
        <p className="text-sm text-gray-600 text-center mb-8">Philippine Law AI Assistant</p>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex flex-col gap-3">
            <button
              onClick={onLoginClick}
              className="w-full bg-yellow-400 text-blue-900 py-3 rounded-lg hover:bg-yellow-500 transition-all font-medium"
            >
              Login
            </button>
            <button
              onClick={onSignUpClick}
              className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition-all font-medium"
            >
              Sign Up
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400 justify-center">OR</div>
            <button
              onClick={onContinueAsGuest}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              Continue as Guest
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6 px-4">Free mode: Chat history and advanced features disabled</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
