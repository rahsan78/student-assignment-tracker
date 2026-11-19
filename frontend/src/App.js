import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import ProtectedRoute from './components/ProtectedRoute';
import StudentHome from './pages/StudentHome';
import InstructorHome from './pages/InstructorHome';
import CreateAssignment from './pages/CreateAssignment';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRole="Instructor">
              <InstructorHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-assignment"
          element={
            <ProtectedRoute allowedRole="Instructor">
              <CreateAssignment />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
