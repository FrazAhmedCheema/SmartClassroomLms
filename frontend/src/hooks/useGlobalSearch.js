import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectClasses } from '../redux/slices/classesSlice';
import { selectEnrolledClasses } from '../redux/slices/enrolledClassesSlice';

export const useGlobalSearch = (userRole) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get classes based on user role
  const teacherClasses = useSelector(selectClasses);
  const studentClasses = useSelector(selectEnrolledClasses);
  
  const allClasses = useMemo(() => {
    return userRole === 'Teacher' ? teacherClasses : studentClasses;
  }, [userRole, teacherClasses, studentClasses]);

  // Filter classes based on search term
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return allClasses.filter(classItem => 
      classItem.className?.toLowerCase().includes(term) ||
      classItem.subject?.toLowerCase().includes(term) ||
      classItem.description?.toLowerCase().includes(term) ||
      classItem.teacherName?.toLowerCase().includes(term)
    );
  }, [allClasses, searchTerm]);

  // Close search dropdown when clicking outside or when search is empty
  useEffect(() => {
    if (!searchTerm.trim()) {
      setIsSearchOpen(false);
    } else {
      setIsSearchOpen(true);
    }
  }, [searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchOpen(false);
  };

  return {
    searchTerm,
    searchResults,
    isSearchOpen,
    handleSearch,
    clearSearch,
    setIsSearchOpen
  };
};
