import { useState, useEffect } from 'react'

const PostsTab = ({ classroomId }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [classroomId])

  const fetchPosts = async () => {
    try {
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Load from localStorage (shared across tabs) or use default mock data
        const stored = localStorage.getItem('test_posts') || sessionStorage.getItem('test_posts')
        if (stored) {
          const posts = JSON.parse(stored)
          setPosts(posts)
        } else {
          // Initialize with mock data if none exists
          const mockPosts = [
            {
              id: '1',
              content: 'Welcome to the class! Please review the syllabus.',
              pinned: true,
              created_at: new Date().toISOString(),
              teacher: { full_name: 'Test Teacher' },
              comments: [],
            },
          ]
          localStorage.setItem('test_posts', JSON.stringify(mockPosts))
          setPosts(mockPosts)
        }
        setLoading(false)
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      
      const response = await fetch(`http://localhost:3001/api/posts/classrooms/${classroomId}?search=${searchTerm}`, {
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (formData) => {
    try {
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Handle test mode creation - use localStorage (shared across tabs)
        const stored = localStorage.getItem('test_posts') || sessionStorage.getItem('test_posts')
        const posts = stored ? JSON.parse(stored) : []
        const newPost = {
          id: `post-${Date.now()}`,
          content: formData.content,
          pinned: formData.pinned || false,
          visibility: formData.visibility || 'class',
          created_at: new Date().toISOString(),
          teacher: { full_name: 'Test Teacher' },
          comments: [],
        }
        posts.push(newPost)
        localStorage.setItem('test_posts', JSON.stringify(posts))
        setShowCreateForm(false)
        fetchPosts()
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      if (!teacherData) {
        alert('Not authenticated. Please log in again.')
        return
      }
      
      const response = await fetch(`http://localhost:3001/api/posts/classrooms/${classroomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': teacherData.id,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateForm(false)
        fetchPosts()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create post' }))
        alert(errorData.error || 'Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Error creating post. Please try again.')
    }
  }

  const handleTogglePin = async (postId, currentPinned) => {
    try {
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Handle test mode toggle pin - use localStorage (shared across tabs)
        const testPosts = JSON.parse(localStorage.getItem('test_posts') || sessionStorage.getItem('test_posts') || '[]')
        const post = testPosts.find(p => p.id === postId)
        if (post) {
          post.pinned = !currentPinned
          localStorage.setItem('test_posts', JSON.stringify(testPosts))
          fetchPosts()
        }
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      
      const response = await fetch(`http://localhost:3001/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': teacherData.id,
        },
        body: JSON.stringify({ pinned: !currentPinned }),
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Handle test mode deletion
        const testPosts = JSON.parse(localStorage.getItem('test_posts') || sessionStorage.getItem('test_posts') || '[]')
        const updated = testPosts.filter(p => p.id !== postId)
        localStorage.setItem('test_posts', JSON.stringify(updated))
        fetchPosts()
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      if (!teacherData) {
        alert('Not authenticated. Please log in again.')
        return
      }
      
      const response = await fetch(`http://localhost:3001/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        fetchPosts()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete post' }))
        alert(errorData.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post. Please try again.')
    }
  }

  const handleAddComment = async (postId, content) => {
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': teacherData.id,
        },
        body: JSON.stringify({ content, userId: teacherData.id }),
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-curare-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Posts</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              fetchPosts()
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
          />
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-curare-blue text-white rounded-lg hover:bg-blue-700"
          >
            Create Post
          </button>
        </div>
      </div>

      {showCreateForm && (
        <CreatePostForm
          onSave={handleCreatePost}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onTogglePin={handleTogglePin}
            onDelete={handleDeletePost}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No posts yet. Create your first post to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const CreatePostForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    content: '',
    pinned: false,
    visibility: 'class',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Post</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <textarea
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
            placeholder="What would you like to share with the class?"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="rounded border-gray-300 text-curare-blue focus:ring-curare-blue"
            />
            <span className="text-sm text-gray-700">Pin to top</span>
          </label>
          <select
            value={formData.visibility}
            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
          >
            <option value="class">Class Only</option>
            <option value="teachers_only">Teachers Only</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-curare-blue text-white rounded-md hover:bg-blue-700"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  )
}

const PostCard = ({ post, onTogglePin, onDelete, onAddComment, onDeleteComment }) => {
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      onAddComment(post.id, commentText)
      setCommentText('')
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${post.pinned ? 'border-2 border-yellow-400' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {post.pinned && (
              <span className="text-yellow-500">📌</span>
            )}
            <h3 className="font-semibold text-gray-900">{post.teacher?.full_name || 'Teacher'}</h3>
            <span className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onTogglePin(post.id, post.pinned)}
            className="text-gray-400 hover:text-yellow-500"
            title={post.pinned ? 'Unpin' : 'Pin'}
          >
            {post.pinned ? '📌' : '📍'}
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="text-gray-400 hover:text-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-sm text-curare-blue hover:text-blue-700"
        >
          {showComments ? 'Hide' : 'Show'} Comments ({post.comments?.length || 0})
        </button>

        {showComments && (
          <div className="mt-4 space-y-4">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="flex justify-between items-start bg-gray-50 rounded p-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {comment.user?.full_name || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
                <button
                  onClick={() => onDeleteComment(post.id, comment.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}

            <form onSubmit={handleSubmitComment} className="flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-curare-blue text-white rounded-md hover:bg-blue-700"
              >
                Comment
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostsTab

