// pages/Community.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts([
        {
          id: 1,
          title: 'Welcome to GyanPark Community!',
          content: 'We are excited to announce the launch of our community forum.',
          author: 'Admin',
          category: 'announcement',
          createdAt: new Date(),
          replies: 5
        },
        {
          id: 2,
          title: 'Tips for learning programming effectively',
          content: 'Share your tips and strategies for learning programming.',
          author: 'Ramanand',
          category: 'learning',
          createdAt: new Date(Date.now() - 86400000),
          replies: 12
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPosts([{
        id: Date.now(),
        ...newPost,
        author: 'You',
        createdAt: new Date(),
        replies: 0
      }, ...posts]);
      setNewPost({ title: '', content: '', category: 'general' });
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/settings" className="text-green-600 hover:text-green-700 flex items-center gap-2">
            <span>←</span> Back to Settings
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Community Forum</h1>
          <p className="text-gray-600 mt-2">Connect with fellow learners and creators</p>
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Create a Post</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Post Title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="general">General Discussion</option>
                <option value="learning">Learning Tips</option>
                <option value="creator">Creator Corner</option>
                <option value="announcement">Announcements</option>
              </select>
            </div>
            <div>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="What's on your mind?"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
            >
              Post
            </button>
          </form>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">{post.author}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                    <p className="text-gray-600 mt-1">{post.content}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <button className="hover:text-green-600 transition-colors flex items-center gap-1">
                    💬 {post.replies} Replies
                  </button>
                  <button className="hover:text-green-600 transition-colors flex items-center gap-1">
                    ❤️ Like
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;