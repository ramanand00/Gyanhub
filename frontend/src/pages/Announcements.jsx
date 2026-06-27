// pages/Announcements.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/admin/public/content/announcement');
      setAnnouncements(res.data.content || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/settings" className="text-green-600 hover:text-green-700 flex items-center gap-2">
            <span>←</span> Back to Settings
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
          <p className="text-gray-600 mt-2">Stay updated with the latest news and updates</p>
        </div>

        <div className="space-y-6">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">📢</div>
              <p className="text-gray-500">No announcements available.</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement._id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📢</span>
                      <h2 className="text-xl font-bold text-gray-800">{announcement.title}</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="text-gray-600 prose max-w-none" dangerouslySetInnerHTML={{ __html: announcement.content }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;