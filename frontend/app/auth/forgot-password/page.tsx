'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white">
            Agentic<span className="text-purple-500">AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Reset Password</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <p className="text-green-400 text-sm font-medium">
                  If an account exists for {email}, you will receive a password reset link shortly.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-block w-full bg-purple-600 text-white font-bold py-3 
                           rounded-lg hover:bg-purple-500 transition"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-zinc-400 text-sm block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white 
                             rounded-lg px-4 py-3 focus:outline-none 
                             focus:border-purple-500/50 transition text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white font-bold py-3 
                           rounded-lg hover:bg-purple-500 transition 
                           disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 
                                     border-t-white rounded-full animate-spin" />
                    Sending link...
                  </span>
                ) : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!success && (
            <p className="text-center text-zinc-500 text-sm mt-6">
              Remembered your password?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
