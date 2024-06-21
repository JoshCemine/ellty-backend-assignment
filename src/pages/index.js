import { useState, useEffect } from 'react';
import LoginForm from '../components/login';
import SignupForm from '../components/signup';

const IndexPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editableComments, setEditableComments] = useState({});
  const [editMode, setEditMode] = useState(null);
  const [sortOrder, setSortOrder] = useState('mostRecent');
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(null);
  const [newNestedComment, setNewNestedComment] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    sortComments(comments, sortOrder);
  }, [sortOrder]);

  const fetchComments = async () => {
    const res = await fetch('/api/comments');
    const data = await res.json();
    if (data.success) {
      setComments(data.data);
      const initialEditableComments = {};
      data.data.forEach(comment => {
        initialEditableComments[comment._id] = comment.text;
      });
      setEditableComments(initialEditableComments);
      sortComments(data.data, sortOrder);
    }
  };

  const sortComments = (commentsToSort, order) => {
    const sortedComments = [...commentsToSort].sort((a, b) => {
      if (order === 'mostRecent') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
    });
    setComments(sortedComments);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAddComment = async () => {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: "post", text: newComment, author: user.username })
    });
    const data = await res.json();
    if (data.success) {
      const newComments = [...comments, data.data];
      setComments(newComments);
      setEditableComments({
        ...editableComments,
        [data.data._id]: data.data.text
      });
      setNewComment('');
      sortComments(newComments, sortOrder);
      setIsAddingPost(false);
    }
  };

  const handleAddNestedComment = async (parentId, postParentId) => {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: "comment", text: newNestedComment, author: user.username, comment_parent_id: parentId, post_parent_id: postParentId })
    });
    const data = await res.json();
    if (data.success) {
      const newComments = [...comments, data.data];
      setComments(newComments);
      setEditableComments({
        ...editableComments,
        [data.data._id]: data.data.text
      });
      setNewNestedComment('');
      setIsAddingComment(null);
      sortComments(newComments, sortOrder);
    }
  };

  const handleCancelNestedComment = () => {
    setNewNestedComment('');
    setIsAddingComment(null);
  };

  const handleUpdateComment = async (id) => {
    const newText = editableComments[id];
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: newText })
    });
    const data = await res.json();
    if (data.success) {
      const updatedComments = comments.map(comment => comment._id === id ? data.data : comment);
      setComments(updatedComments);
      setEditMode(null);
      sortComments(updatedComments, sortOrder);
    }
  };

  const getNestedCommentIds = (commentId) => {
    let nestedIds = [];
    const findNestedComments = (parentId) => {
      comments.forEach(comment => {
        if (comment.comment_parent_id === parentId) {
          nestedIds.push(comment._id);
          findNestedComments(comment._id);
        }
      });
    };
    findNestedComments(commentId);
    return nestedIds;
  };

  const handleDeleteComment = async (id) => {
    const nestedCommentIds = getNestedCommentIds(id);
    const allIdsToDelete = [id, ...nestedCommentIds];

    for (let commentId of allIdsToDelete) {
      await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });
    }

    const filteredComments = comments.filter(comment => !allIdsToDelete.includes(comment._id));
    setComments(filteredComments);
    const updatedEditableComments = { ...editableComments };
    allIdsToDelete.forEach(commentId => {
      delete updatedEditableComments[commentId];
    });
    setEditableComments(updatedEditableComments);
    sortComments(filteredComments, sortOrder);
  };

  const handleInputChange = (id, value) => {
    setEditableComments({
      ...editableComments,
      [id]: value
    });
  };

  const handleCancelAddComment = () => {
    setNewComment('');
    setIsAddingPost(false);
  };

  const handleCancelEdit = (id) => {
    setEditableComments(prevState => ({
      ...prevState,
      [id]: comments.find(comment => comment._id === id).text
    }));
    setEditMode(null);
  };

  const renderComments = (parentId) => {
    return comments
      .filter(comment => comment.comment_parent_id === parentId)
      .map(comment => (
        <div key={comment._id} className="ml-8 bg-white pt-2 pl-2 rounded mb-2">
          <div className="flex justify-between">
            <div>
              <span className="font-semibold">{comment.author}:</span>
              <span className="text-sm text-gray-500 ml-2">{`${new Date(comment.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${new Date(comment.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`}</span>
            </div>
            <div className="flex space-x-2">
              {editMode === comment._id ? (
                <>
                  <button onClick={() => handleUpdateComment(comment._id)} className="bg-green-500 text-white px-2 py-1 rounded">Confirm</button>
                  <button onClick={() => handleCancelEdit(comment._id)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditMode(comment._id)} className="bg-yellow-500 text-white px-2 py-1 rounded">Update</button>
              )}
              <button onClick={() => handleDeleteComment(comment._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              <button onClick={() => setIsAddingComment(comment._id)} className="bg-blue-500 text-white px-2 py-1 rounded">Comment</button>
            </div>
          </div>
          <input
            type="text"
            value={editableComments[comment._id]}
            onChange={(e) => handleInputChange(comment._id, e.target.value)}
            disabled={editMode !== comment._id}
            className="border border-gray-300 p-2 rounded w-full mt-2"
          />
          {isAddingComment === comment._id && (
            <div className="bg-white p-2 rounded shadow mt-2">
              <input
                type="text"
                value={newNestedComment}
                onChange={(e) => setNewNestedComment(e.target.value)}
                placeholder="New Comment"
                className="border border-gray-300 p-2 rounded w-full"
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleAddNestedComment(comment._id, comment.post_parent_id || comment._id)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Confirm
                </button>
                <button
                  onClick={handleCancelNestedComment}
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {renderComments(comment._id)}
        </div>
      ));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {isLogin ? (
          <LoginForm onToggle={() => setIsLogin(false)} setUser={setUser} />
        ) : (
          <SignupForm onToggle={() => setIsLogin(true)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <h3 className="text-xl mb-4">Hi {user.username}</h3>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      <div className="my-4">
        <h2 className="text-2xl font-bold mb-2">Add Post</h2>
        {!isAddingPost && (
          <button onClick={() => setIsAddingPost(true)} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Add Post</button>
        )}
        {isAddingPost && (
          <div className="bg-white p-4 rounded shadow mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="New Post"
              className="border border-gray-300 p-2 rounded w-full mt-2"
            />
            <div className="flex space-x-2 mt-2">
              <button onClick={handleAddComment} className="bg-green-500 text-white px-2 py-1 rounded">Confirm</button>
              <button onClick={handleCancelAddComment} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Comments</h2>
        <div className="mb-4">
          <button
            onClick={() => setSortOrder('mostRecent')}
            className={`px-4 py-2 rounded ${sortOrder === 'mostRecent' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          >
            Most Recent
          </button>
          <button
            onClick={() => setSortOrder('leastRecent')}
            className={`ml-2 px-4 py-2 rounded ${sortOrder === 'leastRecent' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          >
            Least Recent
          </button>
        </div>
        {comments.filter(comment => comment.type === 'post').map((comment) => (
          <div key={comment._id} className="bg-white p-4 rounded shadow mb-4">
            <div className="flex justify-between">
              <div>
                <span className="font-semibold">{comment.author}:</span>
                <span className="text-sm text-gray-500 ml-2">{`${new Date(comment.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${new Date(comment.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`}</span>
              </div>
              <div className="flex space-x-2">
                {editMode === comment._id ? (
                  <>
                    <button onClick={() => handleUpdateComment(comment._id)} className="bg-green-500 text-white px-2 py-1 rounded">Confirm</button>
                    <button onClick={() => handleCancelEdit(comment._id)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(comment._id)} className="bg-yellow-500 text-white px-2 py-1 rounded">Update</button>
                )}
                <button onClick={() => handleDeleteComment(comment._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                <button onClick={() => setIsAddingComment(comment._id)} className="bg-blue-500 text-white px-2 py-1 rounded">Comment</button>
              </div>
            </div>
            <input
              type="text"
              value={editableComments[comment._id]}
              onChange={(e) => handleInputChange(comment._id, e.target.value)}
              disabled={editMode !== comment._id}
              className="border border-gray-300 p-2 rounded w-full mt-2"
            />
            {isAddingComment === comment._id && (
              <div className="bg-white p-2 rounded shadow mt-2">
                <input
                  type="text"
                  value={newNestedComment}
                  onChange={(e) => setNewNestedComment(e.target.value)}
                  placeholder="New Comment"
                  className="border border-gray-300 p-2 rounded w-full"
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleAddNestedComment(comment._id, comment.post_parent_id || comment._id)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={handleCancelNestedComment}
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {renderComments(comment._id)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndexPage;
