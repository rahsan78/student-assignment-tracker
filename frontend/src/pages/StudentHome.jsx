import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const StudentHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [extensionRequestsLoaded, setExtensionRequestsLoaded] = useState(false);
  const [extensionRequestsError, setExtensionRequestsError] = useState('');
  const [requestingAssignmentId, setRequestingAssignmentId] = useState(null);
  const [requestReason, setRequestReason] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSuccessAssignmentId, setRequestSuccessAssignmentId] = useState(null);
  const dueSoonAssignments = assignments.filter(
    (assignment) => assignment.dueStatus === 'Due soon'
  );
  const overdueAssignments = assignments.filter(
    (assignment) => assignment.dueStatus === 'Overdue'
  );

  const fetchExtensionRequests = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/extensions', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setExtensionRequests(response.data);
      setExtensionRequestsError('');
    } catch (error) {
      setExtensionRequestsError(
        error?.response?.data?.message || 'Failed to load your extension requests.'
      );
    } finally {
      setExtensionRequestsLoaded(true);
    }
  }, [user]);

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
    fetchExtensionRequests();
  }, [user, fetchExtensionRequests]);

  const handleExtensionRequestSubmit = async (e, assignmentId) => {
    e.preventDefault();
    setRequestError('');
    setRequestSuccessAssignmentId(null);

    try {
      await axiosInstance.post(
        '/api/extensions',
        { assignmentId, reason: requestReason },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setRequestReason('');
      setRequestingAssignmentId(null);
      setRequestSuccessAssignmentId(assignmentId);
      await fetchExtensionRequests();
    } catch (error) {
      setRequestError(
        error?.response?.data?.message ||
          'Your extension request could not be submitted. Please try again.'
      );
    }
  };

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
                <button
                  type="button"
                  className="mt-3 rounded bg-blue-600 px-4 py-2 text-white"
                  onClick={() => {
                    setRequestingAssignmentId(
                      requestingAssignmentId === assignment._id ? null : assignment._id
                    );
                    setRequestReason('');
                    setRequestError('');
                    setRequestSuccessAssignmentId(null);
                  }}
                >
                  Request extension
                </button>
                {requestingAssignmentId === assignment._id && (
                  <form
                    className="mt-3"
                    onSubmit={(e) => handleExtensionRequestSubmit(e, assignment._id)}
                  >
                    {requestError && (
                      <div className="mb-3 rounded bg-red-100 p-3 text-red-700">
                        {requestError}
                      </div>
                    )}
                    <textarea
                      required
                      placeholder="Reason for extension"
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      className="mb-3 w-full rounded border p-2"
                    />
                    <button
                      type="submit"
                      className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                      Submit request
                    </button>
                  </form>
                )}
                {requestSuccessAssignmentId === assignment._id && (
                  <p className="mt-3 rounded bg-green-100 p-3 text-green-700">
                    Your request is pending
                  </p>
                )}
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

      <section className="mb-6 rounded bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">My extension requests</h2>
        {extensionRequestsError ? (
          <div className="rounded bg-red-100 p-3 text-red-700">
            {extensionRequestsError}
          </div>
        ) : !extensionRequestsLoaded ? (
          <p>Loading extension requests...</p>
        ) : extensionRequests.length === 0 ? (
          <p>You have no extension requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {extensionRequests.map((extensionRequest) => (
              <li key={extensionRequest._id} className="rounded border p-4">
                <h3 className="font-semibold">
                  {extensionRequest.assignment?.title || 'Assignment unavailable'}
                </h3>
                <p>
                  Due{' '}
                  {extensionRequest.assignment?.dueDate
                    ? new Date(extensionRequest.assignment.dueDate).toLocaleDateString()
                    : 'date unavailable'}
                </p>
                <p>Reason: {extensionRequest.reason}</p>
                <p>Status: {extensionRequest.status}</p>
                <p>
                  Requested{' '}
                  {new Date(extensionRequest.requestedAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex gap-3">
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