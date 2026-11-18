import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    const landingPage = user.role === 'Instructor' ? '/instructor' : '/student';
    return <Navigate to={landingPage} replace />;
  }

  return children;
};

export default ProtectedRoute;