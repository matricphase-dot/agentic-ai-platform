export default function TeamPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Team</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-6 text-gray-600">
          Manage team members and their access to AI agents.
        </p>
        <div className="space-y-4">
          {['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams'].map(
            (name, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 font-bold text-white">
                    {name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{name}</p>
                    <p className="text-sm text-gray-500">
                      {name.split(' ')[0].toLowerCase()}@example.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
                    Member
                  </span>
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
