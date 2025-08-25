import React, { useState, useEffect } from 'react';
import { booksAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Plus, Edit, Trash2, Book } from 'lucide-react';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    Book_Name: '',
    Author: '',
    Year_Published: '',
    ISBN: '',
    Total_Copies: '',
    Category: ''
  });

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, selectedCategory]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      };
      
      const response = await booksAPI.getAll(params);
      const booksData = response.data.data || [];
      setBooks(booksData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(booksData.map(book => book.Category).filter(Boolean))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await booksAPI.update(editingBook.Book_Id, formData);
      } else {
        await booksAPI.create(formData);
      }
      
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error('Failed to save book:', error);
      alert(error.response?.data?.message || 'Failed to save book');
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      Book_Name: book.Book_Name,
      Author: book.Author,
      Year_Published: book.Year_Published,
      ISBN: book.ISBN || '',
      Total_Copies: book.Total_Copies,
      Category: book.Category || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await booksAPI.delete(bookId);
      fetchBooks();
    } catch (error) {
      console.error('Failed to delete book:', error);
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const resetForm = () => {
    setFormData({
      Book_Name: '',
      Author: '',
      Year_Published: '',
      ISBN: '',
      Total_Copies: '',
      Category: ''
    });
    setEditingBook(null);
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Management</h1>
          <p className="text-gray-600">Manage library books and inventory</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Book</span>
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Book_Name">Book Name *</Label>
                <Input
                  id="Book_Name"
                  name="Book_Name"
                  value={formData.Book_Name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="Author">Author *</Label>
                <Input
                  id="Author"
                  name="Author"
                  value={formData.Author}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="Year_Published">Year Published *</Label>
                <Input
                  id="Year_Published"
                  name="Year_Published"
                  type="number"
                  value={formData.Year_Published}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ISBN">ISBN</Label>
                <Input
                  id="ISBN"
                  name="ISBN"
                  value={formData.ISBN}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="Total_Copies">Total Copies *</Label>
                <Input
                  id="Total_Copies"
                  name="Total_Copies"
                  type="number"
                  min="1"
                  value={formData.Total_Copies}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="Category">Category</Label>
                <Input
                  id="Category"
                  name="Category"
                  value={formData.Category}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="md:col-span-2 flex space-x-4">
                <Button type="submit">
                  {editingBook ? 'Update Book' : 'Add Book'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Books</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Filter by Category</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Books ({books.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {books.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book Name</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Available/Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.Book_Id}>
                    <TableCell className="font-medium">{book.Book_Name}</TableCell>
                    <TableCell>{book.Author}</TableCell>
                    <TableCell>{book.Year_Published}</TableCell>
                    <TableCell>{book.Category || 'Uncategorized'}</TableCell>
                    <TableCell>{book.ISBN || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        book.Available_Copies === 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {book.Available_Copies}
                      </span>
                      <span className="text-gray-500">/{book.Total_Copies}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(book)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(book.Book_Id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first book'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookManagement;
