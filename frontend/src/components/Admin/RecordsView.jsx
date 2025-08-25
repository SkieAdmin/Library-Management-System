import React, { useState, useEffect } from 'react';
import { recordsAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, FileText, Calendar, User, Book, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const RecordsView = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [searchTerm, statusFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        ...(statusFilter && { status: statusFilter })
      };
      
      const response = await recordsAPI.getAll(params);
      let recordsData = response.data.data || [];
      
      // Filter by search term on frontend since API doesn't support it
      if (searchTerm) {
        recordsData = recordsData.filter(record => 
          record.Book_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.Email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setRecords(recordsData);
      
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (recordId) => {
    try {
      await recordsAPI.return({ Record_Id: recordId });
      fetchRecords(); // Refresh the list
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
        <h1 className="text-2xl font-bold text-gray-900">Borrowing Records</h1>
        <p className="text-gray-600">View and manage all library borrowing records</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Records</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by book title, student name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Filter by Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All Status</option>
                <option value="borrowed">Borrowed</option>
                <option value="overdue">Overdue</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{records.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Currently Borrowed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.Status === 'borrowed').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.Status === 'overdue').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Returned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.Status === 'returned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Records ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
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
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <p className="font-medium">{record.FirstName} {record.LastName}</p>
                          <p className="text-sm text-gray-500">{record.Email}</p>
                          <p className="text-xs text-gray-400">{record.Course}</p>
                        </div>
                      </div>
                    </TableCell>
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
                          Mark Returned
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'No borrowing records available'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordsView;
