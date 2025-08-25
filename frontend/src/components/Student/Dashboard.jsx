import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { booksAPI, recordsAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    availableBooks: 0
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch available books
      const booksResponse = await booksAPI.getAll({ available_only: true });
      const availableBooks = booksResponse.data.data || [];
      
      // Fetch all books count
      const allBooksResponse = await booksAPI.getAll();
      const allBooks = allBooksResponse.data.data || [];
      
      // Fetch user's borrowed books
      const recordsResponse = await recordsAPI.getAll({ status: 'borrowed' });
      const borrowed = recordsResponse.data.data || [];
      
      // Fetch overdue books
      const overdueResponse = await recordsAPI.getAll({ status: 'overdue' });
      const overdue = overdueResponse.data.data || [];
      
      setStats({
        totalBooks: allBooks.length,
        borrowedBooks: borrowed.length,
        overdueBooks: overdue.length,
        availableBooks: availableBooks.length
      });
      
      // Get recent books (latest 6)
      setRecentBooks(availableBooks.slice(0, 6));
      setBorrowedBooks(borrowed.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (bookId) => {
    try {
      await recordsAPI.borrow({ Book_Id: bookId });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to borrow book:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.FirstName}!
        </h1>
        <p className="text-gray-600">Here's your library overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Borrowed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.borrowedBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Books */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBooks.map((book) => (
                <div key={book.Book_Id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{book.Book_Name}</h4>
                    <p className="text-sm text-gray-600">by {book.Author}</p>
                    <p className="text-xs text-gray-500">{book.Category} • {book.Year_Published}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBorrowBook(book.Book_Id)}
                    disabled={book.Available_Copies === 0}
                  >
                    Borrow
                  </Button>
                </div>
              ))}
              {recentBooks.length === 0 && (
                <p className="text-gray-500 text-center py-4">No books available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Borrowed Books */}
        <Card>
          <CardHeader>
            <CardTitle>My Borrowed Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {borrowedBooks.map((record) => (
                <div key={record.Record_Id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{record.Book_Name}</h4>
                    <p className="text-sm text-gray-600">by {record.Author}</p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(record.Date_Due).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      record.Status === 'overdue' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.Status}
                    </span>
                  </div>
                </div>
              ))}
              {borrowedBooks.length === 0 && (
                <p className="text-gray-500 text-center py-4">No borrowed books</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
