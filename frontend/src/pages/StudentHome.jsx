import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StudentHome = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Student Home</h1>

      <section className="mb-6 rounded bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Assignments</h2>
        <ul className="space-y-3">
          <li className="rounded border p-4">Research Paper — Due Nov 20</li>
          <li className="rounded border p-4">Project Proposal — Due Nov 27</li>
        </ul>
      </section>

      <section className="mb-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">Due soon</h2>
          <p>Research Paper — Due Nov 20</p>
        </div>
        <div className="rounded bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">Overdue</h2>
          <p>No overdue assignments.</p>
        </div>
      </section>

      <div className="flex gap-3">
        <button type="button" className="rounded bg-blue-600 px-4 py-2 text-white">
          Request extension
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded bg-red-500 px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    </main>
  );
};

export default StudentHome;