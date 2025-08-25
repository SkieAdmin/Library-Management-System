import React, { useState, useEffect } from 'react';
import { booksAPI, studentsAPI, recordsAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BookOpen, Users, FileText, AlertCircle, TrendingUp, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalStudents: 0,
    totalRecords: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    availableBooks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [booksResponse, studentsResponse, recordsResponse, borrowedResponse, overdueResponse] = await Promise.all([
        booksAPI.getAll(),
        studentsAPI.getAll(),
        recordsAPI.getAll(),
        recordsAPI.getAll({ status: 'borrowed' }),
        recordsAPI.getAll({ status: 'overdue' })
      ]);
      
      const books = booksResponse.data.data || [];
      const students = studentsResponse.data.data || [];
      const records = recordsResponse.data.data || [];
      const borrowed = borrowedResponse.data.data || [];
      const overdue = overdueResponse.data.data || [];
      
      // Calculate available books
      const availableBooks = books.reduce((sum, book) => sum + book.Available_Copies, 0);
      
      setStats({
        totalBooks: books.length,
        totalStudents: students.length,
        totalRecords: records.length,
        borrowedBooks: borrowed.length,
        overdueBooks: overdue.length,
        availableBooks: availableBooks
      });
      
      // Set recent activity (latest 10 records)
      setRecentActivity(records.slice(0, 10));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Library management overview and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
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
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Borrowing Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((record) => (
                <div key={record.Record_Id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{record.Book_Name}</h4>
                    <p className="text-sm text-gray-600">
                      {record.FirstName} {record.LastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.Date_Borrowed).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      record.Status === 'overdue' 
                        ? 'bg-red-100 text-red-800'
                        : record.Status === 'returned'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.Status}
                    </span>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/add-book"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Add New Book</p>
              </a>
              
              <a
                href="/students"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Manage Students</p>
              </a>
              
              <a
                href="/records"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">View Records</p>
              </a>
              
              <a
                href="/books"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <BookOpen className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Manage Books</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
