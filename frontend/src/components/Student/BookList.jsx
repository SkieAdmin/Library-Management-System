import React, { useState, useEffect } from 'react';
import { booksAPI, recordsAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Search, Book, Calendar, User } from 'lucide-react';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, selectedCategory]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        available_only: true,
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

  const handleBorrowBook = async (bookId) => {
    try {
      await recordsAPI.borrow({ Book_Id: bookId });
      fetchBooks(); // Refresh the list
    } catch (error) {
      console.error('Failed to borrow book:', error);
      alert(error.response?.data?.message || 'Failed to borrow book');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
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
        <h1 className="text-2xl font-bold text-gray-900">Browse Books</h1>
        <p className="text-gray-600">Find and borrow books from our collection</p>
      </div>

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
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Filter by Category</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
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

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Card key={book.Book_Id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{book.Book_Name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{book.Author}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{book.Year_Published}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Book className="h-4 w-4 mr-2" />
                  <span>{book.Category || 'Uncategorized'}</span>
                </div>
                
                {book.ISBN && (
                  <div className="text-sm text-gray-500">
                    ISBN: {book.ISBN}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    {book.Available_Copies} available
                  </span>
                  <span className="text-gray-500"> of {book.Total_Copies}</span>
                </div>
                
                <Button
                  onClick={() => handleBorrowBook(book.Book_Id)}
                  disabled={book.Available_Copies === 0}
                  size="sm"
                >
                  {book.Available_Copies === 0 ? 'Not Available' : 'Borrow'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filter criteria'
                : 'No books are currently available'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookList;
