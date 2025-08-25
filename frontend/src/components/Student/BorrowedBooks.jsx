import React, { useState, useEffect } from 'react';
import { recordsAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Calendar, Book, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const BorrowedBooks = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBorrowedBooks();
  }, [filter]);

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await recordsAPI.getAll(params);
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (recordId) => {
    try {
      await recordsAPI.return({ Record_Id: recordId });
      fetchBorrowedBooks(); // Refresh the list
    } catch (error) {
      console.error('Failed to return book:', error);
      alert(error.response?.data?.message || 'Failed to return book');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'borrowed':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'returned':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'borrowed':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate, status) => {
    return status !== 'returned' && new Date(dueDate) < new Date();
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
        <h1 className="text-2xl font-bold text-gray-900">My Borrowed Books</h1>
        <p className="text-gray-600">Track your borrowed books and return dates</p>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All Records
            </Button>
            <Button
              variant={filter === 'borrowed' ? 'default' : 'outline'}
              onClick={() => setFilter('borrowed')}
              size="sm"
            >
              Currently Borrowed
            </Button>
            <Button
              variant={filter === 'overdue' ? 'default' : 'outline'}
              onClick={() => setFilter('overdue')}
              size="sm"
            >
              Overdue
            </Button>
            <Button
              variant={filter === 'returned' ? 'default' : 'outline'}
              onClick={() => setFilter('returned')}
              size="sm"
            >
              Returned
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Borrowing History</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Borrowed Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.Record_Id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Book className="h-4 w-4 mr-2 text-gray-500" />
                        {record.Book_Name}
                      </div>
                    </TableCell>
                    <TableCell>{record.Author}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        {new Date(record.Date_Borrowed).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center ${
                        isOverdue(record.Date_Due, record.Status) ? 'text-red-600' : ''
                      }`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(record.Date_Due).toLocaleDateString()}
                        {isOverdue(record.Date_Due, record.Status) && (
                          <AlertCircle className="h-4 w-4 ml-2" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.Date_Returned ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {new Date(record.Date_Returned).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not returned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(record.Status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.Status)}`}>
                          {record.Status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.Status !== 'returned' && (
                        <Button
                          size="sm"
                          onClick={() => handleReturnBook(record.Record_Id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Return Book
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You haven't borrowed any books yet"
                  : `No ${filter} books found`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BorrowedBooks;
