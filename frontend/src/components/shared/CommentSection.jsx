import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, MoreVertical, Trash2 } from 'lucide-react';

const CommentSection = ({ 
  post, 
  isTeacher, 
  commentInputs, 
  setCommentInputs, 
  handleCommentSubmit, 
  handleDeleteComment, 
  isCommentAuthor 
}) => {
  // Add state for comment actions menu
  const [activeCommentMenu, setActiveCommentMenu] = useState(null);
  // Add hover state for comment action buttons
  const [hoverState, setHoverState] = useState({});

  // Toggle comment menu function
  const toggleCommentMenu = (commentId, e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    if (activeCommentMenu === commentId) {
      setActiveCommentMenu(null);
    } else {
      setActiveCommentMenu(commentId);
    }
  };
  
  // Handle document clicks to close active menu
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeCommentMenu) {
        setActiveCommentMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeCommentMenu]);

  return (
    <>
      {/* Display comments */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
          <div className="space-y-3">
            {post.comments.map((comment, commentIndex) => (
              <div key={comment._id || `comment-${commentIndex}`} className="flex items-start group relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3" 
                     style={{ backgroundColor: comment.authorRole === 'Teacher' ? '#1e40af' : '#4b5563', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  {/* Display appropriate initial */}
                  {isTeacher && comment.authorRole === 'Teacher' ? 'Y' : comment.author?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 relative">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 transition-shadow hover:shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 text-sm">
                          {isTeacher && comment.authorRole === 'Teacher' ? 'You' : comment.author?.name || 'User'}
                        </span>
                        {comment.authorRole === 'Teacher' && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                            Teacher
                          </span>
                        )}
                      </div>
                      
                      {/* Comment actions menu button - styled more elegantly with white background */}
                      {isCommentAuthor(comment) && (
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => toggleCommentMenu(comment._id, e)}
                            onMouseEnter={() => setHoverState({ ...hoverState, [comment._id]: true })}
                            onMouseLeave={() => setHoverState({ ...hoverState, [comment._id]: false })}
                            className={`p-1.5 rounded-full transition-all duration-200 ${
                              activeCommentMenu === comment._id ? 'bg-gray-100' : 
                              hoverState[comment._id] ? 'bg-gray-50' : 'bg-white'
                            }`}
                            style={{ backgroundColor: 'white' }}
                            title="Comment actions"
                          >
                            <MoreVertical size={14} className={
                              activeCommentMenu === comment._id ? 'text-gray-700' : 
                              hoverState[comment._id] ? 'text-gray-600' : 'text-gray-400'
                            } />
                          </button>
                          
                          {/* Enhanced dropdown menu with elegant styling */}
                          {activeCommentMenu === comment._id && (
                            <div 
                              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-10 py-2 w-32 transform origin-top-right transition-transform"
                              style={{ 
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                animation: 'scaleIn 0.2s ease-out',
                                backgroundColor: 'white' 
                              }}
                            >
                              {/* Only delete option with white background */}
                              <button 
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all duration-200 group"
                                style={{ backgroundColor: 'white' }}
                                onClick={() => {
                                  handleDeleteComment(post._id, comment._id);
                                  setActiveCommentMenu(null);
                                }}
                              >
                                <Trash2 size={15} className="mr-2 text-gray-500 group-hover:text-red-500 transition-colors" />
                                <span className="font-medium">Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-800 text-sm">{comment.content}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-2">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Comment input - remove initial circle */}
      <div className="mt-4 pt-3 flex items-center" style={{ borderTop: post.comments?.length ? 'none' : '1px solid #f3f4f6' }}>
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Add class comment..." 
            className="w-full py-2 px-3 bg-white border-2 border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            style={{ 
              transition: 'all 0.2s ease', 
              color: '#333333', 
              fontWeight: '500',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            value={commentInputs[post._id] || ''}
            onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCommentSubmit(post._id, commentInputs[post._id] || '');
              }
            }}
          />
        </div>
        <button 
          className="ml-2 p-2 rounded-full" 
          style={{ backgroundColor: 'rgba(27, 104, 179, 0.1)', color: '#1b68b3' }}
          onClick={() => handleCommentSubmit(post._id, commentInputs[post._id] || '')}
          disabled={!commentInputs[post._id]?.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </>
  );
};

export default CommentSection;
