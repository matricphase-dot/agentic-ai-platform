export default function ProjectsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Projects</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-4 text-gray-600">
          Manage your AI agent projects and workflows.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-lg font-bold text-blue-600">P{i}</span>
              </div>
              <h3 className="mb-2 font-bold text-gray-900">Project {i}</h3>
              <p className="mb-4 text-sm text-gray-600">
                Description of project {i}
              </p>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View Details →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
