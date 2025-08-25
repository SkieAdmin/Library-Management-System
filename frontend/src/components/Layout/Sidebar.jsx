import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Book, 
  Users, 
  FileText, 
  Plus,
  BookOpen,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const studentNavItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/books', icon: BookOpen, label: 'Browse Books' },
    { to: '/my-books', icon: History, label: 'My Borrowed Books' },
  ];

  const adminNavItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/books', icon: Book, label: 'Manage Books' },
    { to: '/students', icon: Users, label: 'Manage Students' },
    { to: '/records', icon: FileText, label: 'Borrowing Records' },
    { to: '/add-book', icon: Plus, label: 'Add Book' },
  ];

  const navItems = isAdmin() ? adminNavItems : studentNavItems;

  return (
    <aside className="w-64 bg-white shadow-sm border-r">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
