// pages/admin/ContentManager.jsx - Add this button in the header
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const ContentManager = () => {
  const [stats, setStats] = useState({
    faq: 0,
    documentation: 0,
    policy: 0,
    announcement: 0,
    help: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [creatingDefault, setCreatingDefault] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/admin/content/stats');
      setStats(res.data.stats || {
        faq: 0,
        documentation: 0,
        policy: 0,
        announcement: 0,
        help: 0,
        total: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create default content via API
  const createDefaultContent = async () => {
    if (!confirm('This will create default FAQs, Documentation, Policies, Announcements, and Help Articles. Continue?')) {
      return;
    }

    setCreatingDefault(true);
    try {
      const res = await API.post('/api/admin/content/create-default');
      if (res.data.success) {
        alert(`✅ ${res.data.created} items created successfully!`);
        fetchStats();
      }
    } catch (error) {
      alert('Failed to create default content: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreatingDefault(false);
    }
  };

  const contentCards = [
    {
      id: 'faq',
      title: 'FAQs',
      icon: '❓',
      description: 'Manage frequently asked questions',
      count: stats.faq || 0,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-600',
      path: '/admin/content/faq',
      features: ['Add FAQ', 'Edit FAQ', 'Delete FAQ', 'Reorder FAQs']
    },
    {
      id: 'documentation',
      title: 'Documentation',
      icon: '📖',
      description: 'Manage documentation guides',
      count: stats.documentation || 0,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-600',
      path: '/admin/content/documentation',
      features: ['Add Guide', 'Edit Guide', 'Delete Guide', 'Organize Guides']
    },
    {
      id: 'policy',
      title: 'Policies',
      icon: '📄',
      description: 'Manage legal policies',
      count: stats.policy || 0,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-600',
      path: '/admin/content/policy',
      features: ['Privacy Policy', 'Terms of Service', 'Cookies Policy', 'Edit Policies']
    },
    {
      id: 'announcement',
      title: 'Announcements',
      icon: '📢',
      description: 'Manage platform announcements',
      count: stats.announcement || 0,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-600',
      path: '/admin/content/announcement',
      features: ['Create Announcement', 'Edit Announcement', 'Delete Announcement', 'Publish Updates']
    },
    {
      id: 'help',
      title: 'Help Articles',
      icon: '💡',
      description: 'Manage help and support articles',
      count: stats.help || 0,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-500',
      textColor: 'text-pink-600',
      path: '/admin/content/help',
      features: ['Add Help Article', 'Edit Article', 'Delete Article', 'Organize Topics']
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">📝 Content Manager</h1>
            <p className="text-gray-400 mt-1">Manage all your content from one place</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              Total: <span className="text-white font-bold">{stats.total}</span> items
            </span>
            <button
              onClick={createDefaultContent}
              disabled={creatingDefault}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors text-sm flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {creatingDefault ? (
                <>
                  <span className="animate-spin">⏳</span> Creating...
                </>
              ) : (
                <>
                  ⚡ Create Default Content
                </>
              )}
            </button>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {contentCards.map((card) => (
            <Link
              key={card.id}
              to={card.path}
              className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center hover:border-green-500 transition-colors group"
            >
              <div className="text-3xl mb-1">{card.icon}</div>
              <div className="text-2xl font-bold text-white">{card.count}</div>
              <div className="text-xs text-gray-400 group-hover:text-green-400 transition-colors">{card.title}</div>
            </Link>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">Quick Start Guide</h3>
              <p className="text-gray-400 text-sm mt-1">
                Click <span className="text-purple-400 font-medium">"Create Default Content"</span> to automatically add 
                sample FAQs, Documentation, Policies, Announcements, and Help Articles. 
                You can then edit or delete them as needed.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">❓ 10 FAQs</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">📖 4 Guides</span>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">📄 3 Policies</span>
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">📢 1 Announcement</span>
                <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full">💡 2 Help Articles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentCards.map((card) => (
            <Link
              key={card.id}
              to={card.path}
              className="group bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1"
            >
              <div className={`p-6 bg-gradient-to-r ${card.color}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-4xl mb-2">{card.icon}</div>
                    <h3 className="text-xl font-bold text-white">{card.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{card.description}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                    {card.count} items
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                  {card.features.map((feature, index) => (
                    <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {card.count === 0 ? 'No items yet' : `${card.count} item${card.count > 1 ? 's' : ''}`}
                  </span>
                  <span className="text-green-400 group-hover:translate-x-1 transition-transform text-sm font-medium flex items-center gap-1">
                    Manage <span className="text-lg">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentManager;