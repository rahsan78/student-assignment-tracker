import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const StudentHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);
  const [error, setError] = useState('');
  const dueSoonAssignments = assignments.filter(
    (assignment) => assignment.dueStatus === 'Due soon'
  );
  const overdueAssignments = assignments.filter(
    (assignment) => assignment.dueStatus === 'Overdue'
  );

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axiosInstance.get('/api/assignments/student', {
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
      <h1 className="mb-6 text-3xl font-bold">Student Home</h1>

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
                <p>Due status: {assignment.dueStatus}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mb-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">Due soon</h2>
          {!assignmentsLoaded ? (
            <p>Loading assignments...</p>
          ) : error ? (
            <p>Unable to load assignment status.</p>
          ) : dueSoonAssignments.length === 0 ? (
            <p>No assignments due soon.</p>
          ) : (
            <ul className="space-y-2">
              {dueSoonAssignments.map((assignment) => (
                <li key={assignment._id}>
                  {assignment.title} — Due {new Date(assignment.dueDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">Overdue</h2>
          {!assignmentsLoaded ? (
            <p>Loading assignments...</p>
          ) : error ? (
            <p>Unable to load assignment status.</p>
          ) : overdueAssignments.length === 0 ? (
            <p>No overdue assignments.</p>
          ) : (
            <ul className="space-y-2">
              {overdueAssignments.map((assignment) => (
                <li key={assignment._id}>
                  {assignment.title} — Due {new Date(assignment.dueDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
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