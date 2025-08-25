import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';

// Student Components
import StudentDashboard from './components/Student/Dashboard';
import BookList from './components/Student/BookList';
import BorrowedBooks from './components/Student/BorrowedBooks';

// Admin Components
import AdminDashboard from './components/Admin/Dashboard';
import BookManagement from './components/Admin/BookManagement';
import StudentManagement from './components/Admin/StudentManagement';
import RecordsView from './components/Admin/RecordsView';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DashboardRouter />} />
            <Route path="books" element={<BooksRouter />} />
            <Route path="my-books" element={<BorrowedBooks />} />
            <Route path="students" element={
              <ProtectedRoute adminOnly>
                <StudentManagement />
              </ProtectedRoute>
            } />
            <Route path="records" element={
              <ProtectedRoute adminOnly>
                <RecordsView />
              </ProtectedRoute>
            } />
            <Route path="add-book" element={
              <ProtectedRoute adminOnly>
                <BookManagement />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Router component to handle role-based dashboard routing
const DashboardRouter = () => {
  const { isAdmin } = useAuth();
  
  return isAdmin() ? <AdminDashboard /> : <StudentDashboard />;
};

// Router component to handle role-based books routing
const BooksRouter = () => {
  const { isAdmin } = useAuth();
  
  return isAdmin() ? <BookManagement /> : <BookList />;
};

export default App;
