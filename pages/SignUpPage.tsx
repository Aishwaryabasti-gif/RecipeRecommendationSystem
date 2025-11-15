import React from 'react';

type Page = 'home' | 'login' | 'signup' | 'dashboard';

interface SignUpPageProps {
  onSignUp: () => void;
  onNavigate: (page: Page) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onNavigate }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd create a new user here
    onSignUp();
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white/50 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-stone-200/80">
        <h2 className="text-center text-3xl font-bold text-stone-800 mb-6">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition bg-white/70"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition bg-white/70"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition bg-white/70"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-stone-600 mt-6">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="font-semibold text-green-600 hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;