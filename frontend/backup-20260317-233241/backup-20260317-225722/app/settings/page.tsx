export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Settings</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              General Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  defaultValue="Agentic AI Inc."
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500">
                  <option>UTC</option>
                  <option>EST</option>
                  <option>PST</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              API Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="sk-..."
                />
              </div>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
