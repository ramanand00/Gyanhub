// pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt, 
  FaGraduationCap, FaCode, FaHeart, FaLinkedin, FaGithub, 
  FaTwitter, FaInstagram, FaFacebook, FaYoutube, FaGlobe,
  FaCheckCircle, FaEdit, FaPlus, FaTimes, FaCog, FaLink,
  FaBriefcase, FaLaptop, FaBook, FaMusic, FaCamera,
  FaFilm, FaGamepad, FaPlane, FaUtensils, FaFutbol,
  FaPaintBrush, FaMicrophone, FaTree, FaDog, FaCat,
  FaCameraRetro, FaHeadphones, FaPalette, FaTshirt,
  FaGem, FaRocket, FaStar, FaHeartbeat, FaLeaf,
  FaAppleAlt, FaBicycle, FaCar, FaShip, FaTrain,
  FaBus, FaPlaneDeparture, FaUmbrella, FaSun, FaMoon
} from 'react-icons/fa';
import { 
  FiEdit2, FiX, FiSave, FiUser, FiMail, FiPhone, FiCalendar,
  FiMapPin, FiBook, FiCode, FiHeart, FiLink, FiGlobe,
  FiCheck, FiPlus, FiSettings, FiBriefcase, FiCpu, FiBookOpen
} from 'react-icons/fi';

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    mobileNumber: '',
    bio: '',
    profilePicture: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
    },
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      website: '',
    },
    education: [],
    skills: [],
    interests: [],
  });

  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: '',
    current: false,
    description: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        mobileNumber: user.mobileNumber || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          pincode: '',
        },
        socialLinks: user.socialLinks || {
          linkedin: '',
          github: '',
          twitter: '',
          instagram: '',
          facebook: '',
          youtube: '',
          website: '',
        },
        education: user.education || [],
        skills: user.skills || [],
        interests: user.interests || [],
      });
    }
  }, [user]);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate account age
  const getAccountAge = (date) => {
    if (!date) return 'N/A';
    const created = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await API.put('/api/settings/update-profile', profileData);
      setMessage(res.data.message);
      // Update user context
      const token = localStorage.getItem('token');
      login(token, res.data.user);
      setIsEditing(false);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Add education
  const addEducation = () => {
    if (!newEducation.institution || !newEducation.degree) {
      setError('Please fill in institution and degree');
      return;
    }
    setProfileData({
      ...profileData,
      education: [...profileData.education, { ...newEducation, id: Date.now() }]
    });
    setNewEducation({
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      current: false,
      description: '',
    });
    setError('');
  };

  // Remove education
  const removeEducation = (index) => {
    const updatedEducation = profileData.education.filter((_, i) => i !== index);
    setProfileData({ ...profileData, education: updatedEducation });
  };

  // Add skill
  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  // Remove skill
  const removeSkill = (skill) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(s => s !== skill)
    });
  };

  // Add interest
  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  // Remove interest
  const removeInterest = (interest) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(i => i !== interest)
    });
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          profilePicture: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Get interest icon based on keyword
  const getInterestIcon = (interest) => {
    const lower = interest.toLowerCase();
    if (lower.includes('music')) return <FaMusic />;
    if (lower.includes('reading') || lower.includes('book')) return <FaBook />;
    if (lower.includes('coding') || lower.includes('programming')) return <FaCode />;
    if (lower.includes('travel')) return <FaPlane />;
    if (lower.includes('cooking') || lower.includes('food')) return <FaUtensils />;
    if (lower.includes('sport') || lower.includes('football') || lower.includes('soccer')) return <FaFutbol />;
    if (lower.includes('art') || lower.includes('paint')) return <FaPaintBrush />;
    if (lower.includes('photography')) return <FaCamera />;
    if (lower.includes('movie') || lower.includes('film')) return <FaFilm />;
    if (lower.includes('gaming')) return <FaGamepad />;
    if (lower.includes('nature') || lower.includes('tree')) return <FaTree />;
    if (lower.includes('dog')) return <FaDog />;
    if (lower.includes('cat')) return <FaCat />;
    if (lower.includes('music')) return <FaHeadphones />;
    if (lower.includes('fashion')) return <FaTshirt />;
    if (lower.includes('design')) return <FaPalette />;
    if (lower.includes('jewelry') || lower.includes('gem')) return <FaGem />;
    if (lower.includes('rocket') || lower.includes('space')) return <FaRocket />;
    if (lower.includes('star')) return <FaStar />;
    if (lower.includes('health')) return <FaHeartbeat />;
    if (lower.includes('yoga') || lower.includes('meditation')) return <FaLeaf />;
    if (lower.includes('apple') || lower.includes('fruit')) return <FaAppleAlt />;
    if (lower.includes('bike') || lower.includes('cycling')) return <FaBicycle />;
    if (lower.includes('car') || lower.includes('auto')) return <FaCar />;
    if (lower.includes('ship') || lower.includes('boat')) return <FaShip />;
    if (lower.includes('train')) return <FaTrain />;
    if (lower.includes('bus')) return <FaBus />;
    if (lower.includes('beach') || lower.includes('sun')) return <FaSun />;
    if (lower.includes('rain') || lower.includes('moon')) return <FaMoon />;
    if (lower.includes('umbrella')) return <FaUmbrella />;
    if (lower.includes('plane')) return <FaPlaneDeparture />;
    return <FiHeart />;
  };

  // View Mode
  if (!isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl overflow-hidden">
                {profileData.profilePicture ? (
                  <img 
                    src={profileData.profilePicture} 
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {profileData.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <FaCheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-800">
              {profileData.name}
            </h2>
            {/* <p className="text-gray-600"><FiMail className="inline mr-1" /> {user?.email}</p> */}
            
            {profileData.bio && (
              <p className="mt-2 text-gray-700 max-w-md mx-auto">{profileData.bio}</p>
            )}
            
            <div className="mt-3 flex items-center justify-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full">
                <FaCheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm font-medium text-green-700">Active</span>
              </span>
              
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200"
              >
                <FiEdit2 className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Personal Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaUser className="w-5 h-5 mr-2 text-green-600" />
                    Personal Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                      <p className="text-base font-semibold text-gray-800 mt-1 flex items-center">
                        <FiUser className="mr-2 text-gray-400" /> {profileData.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</p>
                      <p className="text-base font-semibold text-gray-800 mt-1 flex items-center break-all">
                        <FiMail className="mr-2 text-gray-400" /> {user?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</p>
                      <p className="text-base font-semibold text-gray-800 mt-1 flex items-center">
                        <FiPhone className="mr-2 text-gray-400" /> {profileData.mobileNumber || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</p>
                      <p className="text-base font-semibold text-gray-800 mt-1 flex items-center">
                        <FiCalendar className="mr-2 text-gray-400" />
                        {formatDate(user?.createdAt)}
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          ({getAccountAge(user?.createdAt)})
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {profileData.address && (profileData.address.street || profileData.address.city) && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</p>
                      <p className="text-base text-gray-800 mt-1 flex items-start">
                        <FiMapPin className="mr-2 text-gray-400 mt-1" />
                        <span>
                          {profileData.address.street && `${profileData.address.street}, `}
                          {profileData.address.city && `${profileData.address.city}, `}
                          {profileData.address.state && `${profileData.address.state}, `}
                          {profileData.address.country}
                          {profileData.address.pincode && ` - ${profileData.address.pincode}`}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              {profileData.education && profileData.education.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaGraduationCap className="w-5 h-5 mr-2 text-green-600" />
                      Education
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <h4 className="font-semibold text-gray-800 flex items-center">
                          <FaGraduationCap className="mr-2 text-green-500" />
                          {edu.institution}
                        </h4>
                        <p className="text-gray-600 ml-7">{edu.degree} {edu.field && `- ${edu.field}`}</p>
                        {edu.startYear && (
                          <p className="text-sm text-gray-500 ml-7">
                            {edu.startYear} {edu.endYear ? `- ${edu.endYear}` : edu.current ? '- Present' : ''}
                          </p>
                        )}
                        {edu.description && (
                          <p className="text-sm text-gray-600 mt-1 ml-7">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {profileData.skills && profileData.skills.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaCode className="w-5 h-5 mr-2 text-green-600" />
                      Skills
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center">
                          <FaCode className="mr-1 text-green-500" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Interests */}
              {profileData.interests && profileData.interests.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaHeart className="w-5 h-5 mr-2 text-green-600" />
                      Interests
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map((interest, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center">
                          <span className="mr-1">{getInterestIcon(interest)}</span>
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Social Links */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaLink className="w-5 h-5 mr-2 text-green-600" />
                    Social Links
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  {profileData.socialLinks?.linkedin && (
                    <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                      <FaLinkedin className="text-xl" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {profileData.socialLinks?.github && (
                    <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors">
                      <FaGithub className="text-xl" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profileData.socialLinks?.twitter && (
                    <a href={profileData.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-3 text-gray-700 hover:text-blue-400 transition-colors">
                      <FaTwitter className="text-xl" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {profileData.socialLinks?.instagram && (
                    <a href={profileData.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-3 text-gray-700 hover:text-pink-600 transition-colors">
                      <FaInstagram className="text-xl" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {profileData.socialLinks?.facebook && (
                    <a href={profileData.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-3 text-gray-700 hover:text-blue-700 transition-colors">
                      <FaFacebook className="text-xl" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {profileData.socialLinks?.youtube && (
                    <a href={profileData.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors">
                      <FaYoutube className="text-xl" />
                      <span>YouTube</span>
                    </a>
                  )}
                  {profileData.socialLinks?.website && (
                    <a href={profileData.socialLinks.website} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-colors">
                      <FaGlobe className="text-xl" />
                      <span>Website</span>
                    </a>
                  )}
                  {!profileData.socialLinks?.linkedin && 
                   !profileData.socialLinks?.github && 
                   !profileData.socialLinks?.twitter && 
                   !profileData.socialLinks?.instagram && 
                   !profileData.socialLinks?.facebook && 
                   !profileData.socialLinks?.youtube && 
                   !profileData.socialLinks?.website && (
                    <p className="text-gray-500 text-sm">No social links added yet</p>
                  )}
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-600 hover:text-gray-800 transition-colors flex items-center"
          >
            <FiX className="mr-1" /> Cancel
          </button>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <FiX className="mr-2 text-red-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaUser className="mr-2 text-green-500" />
              Profile Picture
            </h3>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl overflow-hidden">
                {profileData.profilePicture ? (
                  <img 
                    src={profileData.profilePicture} 
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {profileData.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="mt-1 text-xs text-gray-500">Upload a new profile picture (JPG, PNG, GIF)</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiUser className="mr-2 text-green-500" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-1">Bio / Short Description</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows="3"
                  maxLength="500"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">{profileData.bio?.length || 0}/500 characters</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiMapPin className="mr-2 text-green-500" />
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  value={profileData.address.street}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    address: { ...profileData.address, street: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={profileData.address.city}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    address: { ...profileData.address, city: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  value={profileData.address.state}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    address: { ...profileData.address, state: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  value={profileData.address.country}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    address: { ...profileData.address, country: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Pincode / ZIP</label>
                <input
                  type="text"
                  value={profileData.address.pincode}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    address: { ...profileData.address, pincode: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaLink className="mr-2 text-green-500" />
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaLinkedin className="mr-1 text-blue-600" /> LinkedIn
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.linkedin}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, linkedin: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaGithub className="mr-1" /> GitHub
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.github}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, github: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaTwitter className="mr-1 text-blue-400" /> Twitter / X
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.twitter}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, twitter: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaInstagram className="mr-1 text-pink-600" /> Instagram
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.instagram}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, instagram: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaFacebook className="mr-1 text-blue-700" /> Facebook
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.facebook}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, facebook: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaYoutube className="mr-1 text-red-600" /> YouTube
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.youtube}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, youtube: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://youtube.com/@channel"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaGlobe className="mr-1 text-green-600" /> Personal Website
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.website}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, website: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-green-500" />
              Educational Background
            </h3>
            
            {/* Education List */}
            {profileData.education.map((edu, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3 flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <FaGraduationCap className="mr-2 text-green-500" />
                    {edu.institution}
                  </h4>
                  <p className="text-gray-600 ml-7">{edu.degree} {edu.field && `- ${edu.field}`}</p>
                  {edu.startYear && (
                    <p className="text-sm text-gray-500 ml-7">
                      {edu.startYear} {edu.endYear ? `- ${edu.endYear}` : edu.current ? '- Present' : ''}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX />
                </button>
              </div>
            ))}

            {/* Add Education Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Institution *</label>
                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="University Name"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Degree *</label>
                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="B.Sc., M.A., etc."
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Field of Study</label>
                <input
                  type="text"
                  value={newEducation.field}
                  onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={newEducation.description}
                  onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Additional details"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Start Year</label>
                <input
                  type="number"
                  value={newEducation.startYear}
                  onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="2020"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">End Year</label>
                <input
                  type="number"
                  value={newEducation.endYear}
                  onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="2024"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newEducation.current}
                  onChange={(e) => setNewEducation({ ...newEducation, current: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label className="ml-2 text-gray-700 text-sm font-medium">Currently studying here</label>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Education
                </button>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaCode className="mr-2 text-green-500" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {profileData.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center">
                  <FaCode className="mr-1 text-green-500" />
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-green-500 hover:text-green-700"
                  >
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add a skill (e.g., React, Python)"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <FaPlus className="mr-1" /> Add
              </button>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaHeart className="mr-2 text-green-500" />
              Interests
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {profileData.interests.map((interest, index) => (
                <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center">
                  <span className="mr-1">{getInterestIcon(interest)}</span>
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-2 text-orange-500 hover:text-orange-700"
                  >
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add an interest (e.g., Reading, Coding)"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                <FaPlus className="mr-1" /> Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <FiSave className="mr-2" /> Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition duration-200 flex items-center"
            >
              <FiX className="mr-2" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;