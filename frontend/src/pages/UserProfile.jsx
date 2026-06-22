// pages/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/api/user/profile/${userId}`);
      setProfile(res.data.user);
      setFollowing(res.data.user.isFollowing || false);
      setFollowersCount(res.data.user.followersCount || 0);
      setFollowingCount(res.data.user.followingCount || 0);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      if (error.response?.status === 403) {
        setError('This profile is private');
      } else if (error.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/profile/${userId}` } });
      return;
    }

    if (user._id === userId) {
      return;
    }

    setFollowLoading(true);
    try {
      if (following) {
        await API.post(`/api/user/unfollow/${userId}`);
        setFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await API.post(`/api/user/follow/${userId}`);
        setFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchFollowers = async () => {
    setLoadingFollowers(true);
    try {
      const res = await API.get(`/api/user/followers/${userId}`);
      setFollowersList(res.data.followers);
      setShowFollowers(true);
      setShowFollowing(false);
    } catch (error) {
      console.error('Failed to fetch followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowing = async () => {
    setLoadingFollowers(true);
    try {
      const res = await API.get(`/api/user/following/${userId}`);
      setFollowingList(res.data.following);
      setShowFollowing(true);
      setShowFollowers(false);
    } catch (error) {
      console.error('Failed to fetch following:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAccountAge = (date) => {
    if (!date) return 'N/A';
    const created = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-orange-50">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/courses" 
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors inline-block"
          >
            Browse Courses →
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?._id === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cover Image */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 h-40 relative">
            {profile.isCreator && (
              <div className="absolute top-4 right-4 px-4 py-1.5 bg-orange-500 text-white text-xs rounded-full font-medium shadow-lg">
                🎓 Creator
              </div>
            )}
          </div>
          
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-28 h-28 bg-white rounded-full p-1.5 shadow-xl">
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-4xl font-bold">
                        {profile.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                </div>
                {profile.isCreator && (
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                    🎓
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                  {profile.isCreator && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium inline-block">
                      Creator
                    </span>
                  )}
                </div>
                {profile.bio && (
                  <p className="text-gray-600 mt-1 text-sm max-w-2xl">{profile.bio}</p>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span>📅</span> Joined {formatDate(profile.createdAt)}
                  </span>
                  <span className="hidden md:inline">•</span>
                  <span className="flex items-center gap-1">
                    <span>⏳</span> {getAccountAge(profile.createdAt)} old
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              <div className="flex-shrink-0">
                {!isOwnProfile && user && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 min-w-[130px] ${
                      following
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {followLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : following ? (
                      '✓ Following'
                    ) : (
                      '+ Follow'
                    )}
                  </button>
                )}
                {!user && (
                  <Link
                    to="/login"
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg inline-block"
                  >
                    Login to Follow
                  </Link>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
              <button 
                onClick={() => {
                  setShowFollowers(true);
                  setShowFollowing(false);
                  fetchFollowers();
                }}
                className="text-center hover:bg-gray-50 px-4 py-3 rounded-xl transition-all group"
              >
                <span className="block text-2xl font-bold text-gray-800">{followersCount}</span>
                <span className="text-sm text-gray-500 group-hover:text-green-600 transition-colors">Followers</span>
              </button>
              <button 
                onClick={() => {
                  setShowFollowing(true);
                  setShowFollowers(false);
                  fetchFollowing();
                }}
                className="text-center hover:bg-gray-50 px-4 py-3 rounded-xl transition-all group"
              >
                <span className="block text-2xl font-bold text-gray-800">{followingCount}</span>
                <span className="text-sm text-gray-500 group-hover:text-green-600 transition-colors">Following</span>
              </button>
              {profile.isCreator && (
                <>
                  <div className="text-center px-4 py-3">
                    <span className="block text-2xl font-bold text-gray-800">{profile.totalCourses || 0}</span>
                    <span className="text-sm text-gray-500">Courses</span>
                  </div>
                  <div className="text-center px-4 py-3">
                    <span className="block text-2xl font-bold text-gray-800">{profile.totalStudents || 0}</span>
                    <span className="text-sm text-gray-500">Students</span>
                  </div>
                </>
              )}
              {!profile.isCreator && (
                <>
                  <div className="text-center px-4 py-3">
                    <span className="block text-2xl font-bold text-gray-800">-</span>
                    <span className="text-sm text-gray-500">Courses</span>
                  </div>
                  <div className="text-center px-4 py-3">
                    <span className="block text-2xl font-bold text-gray-800">-</span>
                    <span className="text-sm text-gray-500">Students</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Followers/Following Modals */}
        {showFollowers && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFollowers(false)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-96 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Followers</h3>
                <button 
                  onClick={() => setShowFollowers(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto max-h-72 p-4">
                {loadingFollowers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                ) : followersList.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No followers yet</p>
                ) : (
                  <div className="space-y-3">
                    {followersList.map(follower => (
                      <Link 
                        key={follower._id} 
                        to={`/profile/${follower._id}`}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-all group"
                        onClick={() => setShowFollowers(false)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {follower.profilePicture ? (
                            <img src={follower.profilePicture} alt={follower.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-lg">{follower.name?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                            {follower.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {follower.isCreator ? '🎓 Creator' : '👤 Learner'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showFollowing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFollowing(false)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-96 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Following</h3>
                <button 
                  onClick={() => setShowFollowing(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto max-h-72 p-4">
                {loadingFollowers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                ) : followingList.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Not following anyone yet</p>
                ) : (
                  <div className="space-y-3">
                    {followingList.map(followed => (
                      <Link 
                        key={followed._id} 
                        to={`/profile/${followed._id}`}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-all group"
                        onClick={() => setShowFollowing(false)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {followed.profilePicture ? (
                            <img src={followed.profilePicture} alt={followed.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-lg">{followed.name?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                            {followed.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {followed.isCreator ? '🎓 Creator' : '👤 Learner'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Content Tabs */}
        <div className="mt-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto px-4 md:px-6">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === 'courses'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📚 Courses
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === 'about'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ℹ️ About
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setActiveTab('enrollments')}
                    className={`py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                      activeTab === 'enrollments'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📖 My Learning
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 md:p-6">
              {activeTab === 'courses' && (
                <div>
                  {profile.courses && profile.courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profile.courses.map(course => (
                        <Link 
                          key={course._id} 
                          to={`/course/${course._id}`}
                          className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
                        >
                          <img 
                            src={course.thumbnail || 'https://via.placeholder.com/300x160/059669/ffffff?text=Course'} 
                            alt={course.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-1">
                              {course.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                              <span>{course.totalLessons || 0} lessons</span>
                              <span className="flex items-center gap-1">⭐ {course.rating || 0}</span>
                              <span>{course.enrollments || 0} students</span>
                            </div>
                            <div className="mt-3 text-sm font-bold text-gray-800">
                              {course.price === 0 ? 'Free' : `Rs. ${course.price}`}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📚</div>
                      <p className="text-gray-500">
                        {profile.isCreator ? 'No courses published yet' : 'This user has no courses'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  {/* Bio Section */}
                  {profile.bio && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>📝</span> Bio
                      </h4>
                      <p className="text-gray-600 mt-2">{profile.bio}</p>
                    </div>
                  )}

                  {/* Skills Section */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>💪</span> Skills
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests Section */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>❤️</span> Interests
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.interests.map((interest, index) => (
                          <span key={index} className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education Section */}
                  {profile.education && profile.education.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>🎓</span> Education
                      </h4>
                      <div className="space-y-3 mt-2">
                        {profile.education.map((edu, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="font-medium text-gray-800">{edu.institution}</p>
                            <p className="text-sm text-gray-600">{edu.degree} {edu.field && `- ${edu.field}`}</p>
                            {edu.startYear && (
                              <p className="text-sm text-gray-500">
                                {edu.startYear} {edu.endYear ? `- ${edu.endYear}` : edu.current ? '- Present' : ''}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Links Section */}
                  {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>🔗</span> Social Links
                      </h4>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {profile.socialLinks.linkedin && (
                          <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                            <span>🔗</span> LinkedIn
                          </a>
                        )}
                        {profile.socialLinks.github && (
                          <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            <span>🔗</span> GitHub
                          </a>
                        )}
                        {profile.socialLinks.twitter && (
                          <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-400 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                            <span>🔗</span> Twitter
                          </a>
                        )}
                        {profile.socialLinks.instagram && (
                          <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors text-sm">
                            <span>🔗</span> Instagram
                          </a>
                        )}
                        {profile.socialLinks.facebook && (
                          <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                            <span>🔗</span> Facebook
                          </a>
                        )}
                        {profile.socialLinks.youtube && (
                          <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm">
                            <span>🔗</span> YouTube
                          </a>
                        )}
                        {profile.socialLinks.website && (
                          <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm">
                            <span>🔗</span> Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'enrollments' && isOwnProfile && (
                <div>
                  {profile.recentEnrollments && profile.recentEnrollments.length > 0 ? (
                    <div className="space-y-3">
                      {profile.recentEnrollments.map(enrollment => (
                        <Link 
                          key={enrollment._id} 
                          to={`/course/${enrollment.course?._id}/learn`}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto">
                            <img 
                              src={enrollment.course?.thumbnail || 'https://via.placeholder.com/80x80/059669/ffffff?text=Course'} 
                              alt={enrollment.course?.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors truncate">
                                {enrollment.course?.title || 'Unknown Course'}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex-1 max-w-xs">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 rounded-full h-2 transition-all" 
                                      style={{ width: `${enrollment.progress || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-gray-600">{enrollment.progress || 0}%</span>
                              </div>
                              {enrollment.completed && (
                                <span className="text-xs text-green-600 font-medium mt-1 inline-block">✅ Completed</span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-gray-400 mt-2 sm:mt-0">
                            {new Date(enrollment.createdAt).toLocaleDateString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📖</div>
                      <p className="text-gray-500">You haven't enrolled in any courses yet</p>
                      <Link to="/courses" className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block">
                        Browse Courses →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;