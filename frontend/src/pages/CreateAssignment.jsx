import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const CreateAssignment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      await axiosInstance.post('/api/assignments', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFormData({ title: '', description: '', dueDate: '' });
      setSuccess('Assignment created successfully.');
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          'Unable to create assignment. Please try again.'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Assignment</h1>
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded bg-green-100 p-3 text-green-700">
            {success}
          </div>
        )}
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="date"
          required
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="button"
          onClick={() => navigate('/instructor')}
          className="mb-4 w-full rounded border p-2"
        >
          Back to Instructor Home
        </button>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Create assignment
        </button>
      </form>
    </div>
  );
};

export default CreateAssignment;