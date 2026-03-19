// components/auth/LoginForm.js
export default function LoginForm() {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-6 text-2xl font-bold">Sign In</h2>
      <form className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border px-4 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border px-4 py-2"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
