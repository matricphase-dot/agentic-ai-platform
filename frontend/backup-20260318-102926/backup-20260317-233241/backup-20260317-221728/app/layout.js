import './globals.css';

export const metadata = {
  title: 'Agentic AI Platform - AWS for AI Agents',
  description: 'Orchestrate collaborative AI agents for complex tasks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex min-h-screen flex-col">
          {/* Simple header */}
          <header className="bg-white shadow dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                    <span className="text-white">🤖</span>
                  </div>
                  <h1 className="text-xl font-bold">Agentic AI</h1>
                </div>
                <nav className="hidden space-x-4 md:flex">
                  <a
                    href="/"
                    className="text-gray-700 hover:text-blue-600 dark:text-gray-300"
                  >
                    Dashboard
                  </a>
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    className="text-gray-700 hover:text-blue-600 dark:text-gray-300"
                  >
                    API Docs
                  </a>
                  <a
                    href="http://localhost:8000/health"
                    target="_blank"
                    className="text-gray-700 hover:text-blue-600 dark:text-gray-300"
                  >
                    Health
                  </a>
                </nav>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>

          {/* Simple footer */}
          <footer className="border-t border-gray-200 bg-white py-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 text-center text-gray-600 sm:px-6 lg:px-8 dark:text-gray-400">
              <p>© 2024 Agentic AI Platform. The "AWS for AI Agents".</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
