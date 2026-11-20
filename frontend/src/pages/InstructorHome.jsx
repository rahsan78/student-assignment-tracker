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
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingRequestsLoaded, setPendingRequestsLoaded] = useState(false);
  const [pendingRequestsError, setPendingRequestsError] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [decisionSuccess, setDecisionSuccess] = useState('');
  const [decisionComments, setDecisionComments] = useState({});
  const [decidingRequestId, setDecidingRequestId] = useState(null);

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

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axiosInstance.get('/api/extensions/pending', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPendingRequests(response.data);
      } catch (error) {
        setPendingRequestsError(
          error?.response?.data?.message || 'Failed to load extension requests.'
        );
      } finally {
        setPendingRequestsLoaded(true);
      }
    };

    fetchPendingRequests();
  }, [user]);

  const handleDecision = async (requestId, status) => {
    setDecisionError('');
    setDecisionSuccess('');
    setDecidingRequestId(requestId);

    try {
      await axiosInstance.put(
        `/api/extensions/${requestId}/decision`,
        { status, decisionComment: decisionComments[requestId] || '' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPendingRequests((requests) => requests.filter((request) => request._id !== requestId));
      setDecisionSuccess(
        status === 'Approved' ? 'Extension request approved.' : 'Extension request rejected.'
      );
    } catch (error) {
      setDecisionError(
        error?.response?.data?.message || 'Unable to update the extension request.'
      );
    } finally {
      setDecidingRequestId(null);
    }
  };

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
        {decisionSuccess && (
          <div className="mb-4 rounded bg-green-100 p-3 text-green-700">
            {decisionSuccess}
          </div>
        )}
        {decisionError && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {decisionError}
          </div>
        )}
        {pendingRequestsError ? (
          <div className="rounded bg-red-100 p-3 text-red-700">
            {pendingRequestsError}
          </div>
        ) : !pendingRequestsLoaded ? (
          <p>Loading extension requests...</p>
        ) : pendingRequests.length === 0 ? (
          <p>No pending extension requests.</p>
        ) : (
          <ul className="space-y-3">
            {pendingRequests.map((request) => (
              <li key={request._id} className="rounded border p-4">
                <h3 className="font-semibold">
                  {request.student?.name || 'Student'} — {request.assignment?.title || 'Assignment unavailable'}
                </h3>
                <p>Reason: {request.reason}</p>
                {request.assignment?.dueDate && (
                  <p>
                    Current due date:{' '}
                    {new Date(request.assignment.dueDate).toLocaleDateString()}
                  </p>
                )}
                <label className="mt-3 block">
                  Decision comment (required to reject)
                  <textarea
                    value={decisionComments[request._id] || ''}
                    onChange={(e) =>
                      setDecisionComments({
                        ...decisionComments,
                        [request._id]: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded border p-2"
                  />
                </label>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    disabled={decidingRequestId === request._id}
                    onClick={() => handleDecision(request._id, 'Approved')}
                    className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={decidingRequestId === request._id}
                    onClick={() => handleDecision(request._id, 'Rejected')}
                    className="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
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