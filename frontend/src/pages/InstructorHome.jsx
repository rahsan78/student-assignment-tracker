import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const InstructorHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axiosInstance.get('/api/assignments', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAssignments(response.data);
      } catch (error) {
        setError('Failed to fetch assignments.');
      } finally {
        setAssignmentsLoaded(true);
      }
    };

    fetchAssignments();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Instructor Home</h1>

      <button
        onClick={() => navigate('/create-assignment')}
        type="button"
        className="mb-6 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Create assignment
      </button>

      <section className="mb-6 rounded bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Assignments</h2>
        <ul className="space-y-3">
          {!assignmentsLoaded ? (
            <li>Loading assignments...</li>
          ) : error ? (
            <li>
              <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>
            </li>
          ) : assignments.length === 0 ? (
            <li>You have no assignments yet.</li>
          ) : (
            assignments.map((assignment) => (
              <li key={assignment._id} className="rounded border p-4">
                <h3 className="font-semibold">{assignment.title}</h3>
                <p>{assignment.description}</p>
                <p>Due {new Date(assignment.dueDate).toLocaleDateString()}</p>
              </li>
            ))
          )}
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

      <button
        type="button"
        onClick={handleLogout}
        className="rounded bg-red-500 px-4 py-2 text-white"
      >
        Logout
      </button>
    </main>
  );
};

export default InstructorHome;