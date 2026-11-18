const InstructorHome = () => (
  <main className="container mx-auto max-w-4xl p-6">
    <h1 className="mb-6 text-3xl font-bold">Instructor Home</h1>

    <button
      type="button"
      className="mb-6 rounded bg-blue-600 px-4 py-2 text-white"
    >
      Create assignment
    </button>

    <section className="mb-6 rounded bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Assignments</h2>
      <ul className="space-y-3">
        <li className="rounded border p-4">Research Paper — Due Nov 20</li>
        <li className="rounded border p-4">Project Proposal — Due Nov 27</li>
      </ul>
    </section>

    <section className="mb-6 rounded bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Extension requests</h2>
      <div className="rounded border p-4">
        <p className="mb-3">Alex Smith — Research Paper</p>
        <p className="mb-4">Requested new due date: Nov 22</p>
        <div className="flex gap-3">
          <button type="button" className="rounded bg-green-600 px-4 py-2 text-white">
            Approve
          </button>
          <button type="button" className="rounded bg-red-500 px-4 py-2 text-white">
            Reject
          </button>
        </div>
      </div>
    </section>

    <button type="button" className="rounded bg-red-500 px-4 py-2 text-white">
      Logout
    </button>
  </main>
);

export default InstructorHome;