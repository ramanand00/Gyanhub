// pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiMapPin, 
  FiBook, 
  FiCode, 
  FiHeart, 
  FiLink, 
  FiGlobe,
  FiCheck,
  FiPlus, 
  FiEdit2,
  FiX,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiChevronRight,
  FiStar,
  FiAward,
  FiClock,
  FiEye,
  FiTrendingUp,
  FiPlayCircle,
  FiRefreshCw,
  FiBookOpen,
  FiGrid
} from 'react-icons/fi';
import { 
  FaSpinner,
  FaGraduationCap,
  FaLinkedin, 
  FaGithub, 
  FaTwitter, 
  FaInstagram, 
  FaFacebook, 
  FaYoutube, 
  FaGlobe,
  FaCode,
  FaHeart as FaHeartSolid,
  FaMusic,
  FaBook,
  FaPlane,
  FaUtensils,
  FaFutbol,
  FaPaintBrush,
  FaCamera,
  FaFilm,
  FaGamepad,
  FaTree,
  FaDog,
  FaCat,
  FaHeadphones,
  FaPalette,
  FaGem,
  FaRocket,
  FaStar as FaStarSolid,
  FaHeartbeat,
  FaLeaf,
  FaAppleAlt,
  FaBicycle,
  FaCar,
  FaShip,
  FaTrain,
  FaBus,
  FaUmbrella,
  FaSun,
  FaMoon,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa';
import { 
  MdOutlinePayment,
  MdOutlineTrendingUp,
  MdOutlineDashboard,
  MdOutlinePerson,
  MdOutlineSchool,
  MdOutlineLink,
  MdOutlineStar
} from 'react-icons/md';
import CVPreviewModal from '../components/CVPreviewModal';
import logo from '../assets/logo.png';

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCVPreview, setShowCVPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Learning section states
  const [enrollments, setEnrollments] = useState([]);
  const [learningLoading, setLearningLoading] = useState(true);
  const [learningError, setLearningError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0
  });

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

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name || name === '') {
      return 'U';
    }
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

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

  // Fetch enrollments
  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLearningLoading(true);
    try {
      const res = await API.get('/api/courses/my-courses');
      const allEnrollments = res.data.enrollments;
      
      setEnrollments(allEnrollments);
      
      const total = allEnrollments.length;
      const completed = allEnrollments.filter(e => e.progress === 100).length;
      const inProgress = allEnrollments.filter(e => e.progress > 0 && e.progress < 100).length;
      
      setStats({ total, completed, inProgress });
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      setLearningError('Failed to load your courses');
    } finally {
      setLearningLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getProgressTextColor = (progress) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getPaymentBadge = (enrollment) => {
    if (enrollment.paymentStatus === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-xs font-medium">
          <MdOutlinePayment className="w-3 h-3" />
          Paid
        </span>
      );
    } else if (enrollment.paymentStatus === 'free') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-xs font-medium">
          <FiStar className="w-3 h-3" />
          Free
        </span>
      );
    }
    return null;
  };

  const renderCourseCard = (enrollment) => (
    <div key={enrollment._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border-l-4 border-green-500 hover:border-green-600 group">
      <Link to={`/course/${enrollment.course?._id}/learn`}>
        <div className="relative overflow-hidden">
          <img
            src={enrollment.course?.thumbnail || 'https://via.placeholder.com/400x225/059669/ffffff?text=Course'}
            alt={enrollment.course?.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {enrollment.completed && (
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" />
                Completed
              </span>
            )}
            <div className="flex items-center gap-1">
              {getPaymentBadge(enrollment)}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between text-white text-sm">
              <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                <FiBook className="w-3 h-3" />
                {enrollment.course?.totalLessons || 0} lessons
              </span>
              <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                <FiTrendingUp className="w-3 h-3" />
                {enrollment.progress || 0}% complete
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/course/${enrollment.course?._id}/learn`}>
          <h3 className="font-semibold text-gray-800 text-lg mb-2 hover:text-green-600 transition-colors line-clamp-2">
            {enrollment.course?.title || 'Course'}
          </h3>
        </Link>
        
        <div className="flex items-center text-sm text-gray-500 mb-3 gap-3">
          <span className="flex items-center gap-1">
            <FaChalkboardTeacher className="text-green-600" />
            {enrollment.course?.instructor?.name || 'Instructor'}
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="text-green-600" />
            {new Date(enrollment.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className={`font-bold ${getProgressTextColor(enrollment.progress || 0)}`}>
              {enrollment.progress || 0}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(enrollment.progress || 0)} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${enrollment.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Link
            to={`/course/${enrollment.course?._id}/learn`}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2"
          >
            {enrollment.completed ? (
              <>
                <FiRefreshCw className="w-4 h-4" />
                Review Course
              </>
            ) : (
              <>
                <FiPlayCircle className="w-4 h-4" />
                Continue Learning
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );

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

  // Calculate days since joined
  const calculateDaysSinceJoined = (createdAt) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get member since text
  const getMemberSinceText = (createdAt) => {
    if (!createdAt) return "";
    const days = calculateDaysSinceJoined(createdAt);
    
    if (days === 0) {
      return "Member since today";
    }
    
    if (days <= 7) {
      return `Member for ${days} day${days > 1 ? "s" : ""}`;
    }
    
    const createdDate = new Date(createdAt);
    return `Joined on ${createdDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
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
    if (lower.includes('music')) return <FaMusic className="text-orange-500" />;
    if (lower.includes('reading') || lower.includes('book')) return <FaBook className="text-blue-500" />;
    if (lower.includes('coding') || lower.includes('programming')) return <FaCode className="text-green-500" />;
    if (lower.includes('travel')) return <FaPlane className="text-purple-500" />;
    if (lower.includes('cooking') || lower.includes('food')) return <FaUtensils className="text-red-500" />;
    if (lower.includes('sport') || lower.includes('football') || lower.includes('soccer')) return <FaFutbol className="text-green-600" />;
    if (lower.includes('art') || lower.includes('paint')) return <FaPaintBrush className="text-pink-500" />;
    if (lower.includes('photography')) return <FaCamera className="text-gray-600" />;
    if (lower.includes('movie') || lower.includes('film')) return <FaFilm className="text-indigo-500" />;
    if (lower.includes('gaming')) return <FaGamepad className="text-purple-600" />;
    if (lower.includes('nature') || lower.includes('tree')) return <FaTree className="text-green-700" />;
    if (lower.includes('dog')) return <FaDog className="text-amber-600" />;
    if (lower.includes('cat')) return <FaCat className="text-amber-700" />;
    if (lower.includes('fashion')) return <FaGem className="text-pink-400" />;
    if (lower.includes('design')) return <FaPalette className="text-purple-400" />;
    if (lower.includes('jewelry') || lower.includes('gem')) return <FaGem className="text-teal-500" />;
    if (lower.includes('rocket') || lower.includes('space')) return <FaRocket className="text-gray-700" />;
    if (lower.includes('star')) return <FaStarSolid className="text-yellow-500" />;
    if (lower.includes('health')) return <FaHeartbeat className="text-red-500" />;
    if (lower.includes('yoga') || lower.includes('meditation')) return <FaLeaf className="text-green-500" />;
    if (lower.includes('apple') || lower.includes('fruit')) return <FaAppleAlt className="text-red-400" />;
    if (lower.includes('bike') || lower.includes('cycling')) return <FaBicycle className="text-blue-600" />;
    if (lower.includes('car') || lower.includes('auto')) return <FaCar className="text-gray-600" />;
    if (lower.includes('ship') || lower.includes('boat')) return <FaShip className="text-blue-700" />;
    if (lower.includes('train')) return <FaTrain className="text-red-700" />;
    if (lower.includes('bus')) return <FaBus className="text-green-700" />;
    if (lower.includes('beach') || lower.includes('sun')) return <FaSun className="text-yellow-500" />;
    if (lower.includes('rain') || lower.includes('moon')) return <FaMoon className="text-indigo-400" />;
    if (lower.includes('umbrella')) return <FaUmbrella className="text-blue-400" />;
    return <FiHeart className="text-red-400" />;
  };

  // View Mode
  if (!isEditing) {
    const totalCourses = enrollments.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
        <CVPreviewModal 
          isOpen={showCVPreview}
          onClose={() => setShowCVPreview(false)}
          profileData={profileData}
          user={user}
          formatDate={formatDate}
          getInitials={getInitials}
          platformName="GyanPark"
          logo={logo}
        />
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center shadow-xl overflow-hidden border-4 border-white">
                    {profileData.profilePicture ? (
                      <img 
                        src={profileData.profilePicture} 
                        alt={profileData.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          const initials = getInitials(profileData.name || user?.name || 'User');
                          parent.innerHTML = `<span class="text-white text-3xl font-bold tracking-wider">${initials}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-white text-3xl font-bold tracking-wider">
                        {getInitials(profileData.name || user?.name || 'User')}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left text-white">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold">
                      {profileData.name || user?.name || 'User'}
                    </h2>
                    <span className="inline-flex items-center px-3 py-0.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                      <FiCheckCircle className="w-4 h-4 mr-1" />
                      Active
                    </span>
                  </div>
                  
                  <p className="text-white/80 flex items-center justify-center md:justify-start gap-2 text-sm">
                    <FiMail className="w-4 h-4" />
                    {user?.email}
                  </p>
                  
                  {profileData.bio && (
                    <p className="mt-2 text-white/90 max-w-2xl text-sm">{profileData.bio}</p>
                  )}
                  
                  <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-1.5 bg-white text-green-700 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-md text-sm"
                    >
                      <FiEdit2 className="w-4 h-4 mr-1.5" />
                      Edit Profile
                    </button>
                    
                    <button
                      onClick={() => setShowCVPreview(true)}
                      className="inline-flex items-center px-3 py-1.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-all duration-200 shadow-md text-sm backdrop-blur-sm"
                    >
                      <FiEye className="w-4 h-4 mr-1.5" />
                      View CV
                    </button>
                    
                    <span className="inline-flex items-center px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm backdrop-blur-sm">
                      <FiClock className="w-4 h-4 mr-1.5" />
                      {getMemberSinceText(user?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation - Only 2 Tabs */}
            <div className="px-3 sm:px-6 border-b border-gray-200 bg-gray-50/50">
  <div className="flex gap-2 py-2 sm:py-3">
    <button
      onClick={() => setActiveTab("overview")}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2
        px-3 sm:px-6
        py-2 sm:py-2.5
        rounded-lg sm:rounded-xl
        text-xs sm:text-sm
        font-medium
        transition-all duration-200
        ${
          activeTab === "overview"
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/25"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`}
    >
      <MdOutlineDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
      <span>Overview</span>
    </button>

    <button
      onClick={() => setActiveTab("learning")}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2
        px-3 sm:px-6
        py-2 sm:py-2.5
        rounded-lg sm:rounded-xl
        text-xs sm:text-sm
        font-medium
        transition-all duration-200
        ${
          activeTab === "learning"
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/25"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`}
    >
      <FiBookOpen className="w-4 h-4 sm:w-5 sm:h-5" />

      <span>My Learning</span>

      {totalCourses > 0 && (
        <span
          className={`ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
            activeTab === "learning"
              ? "bg-white/20 text-white"
              : "bg-green-100 text-green-700"
          }`}
        >
          {totalCourses}
        </span>
      )}
    </button>
  </div>
</div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              {/* Overview Tab - Shows only sections with data */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200"> */}
                      {/* <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-700 font-medium">Courses</p>
                          <p className="text-2xl font-bold text-green-800">{totalCourses}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                          <FiBook className="text-green-700" />
                        </div>
                      </div> */}
                    {/* </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-700 font-medium">In Progress</p>
                          <p className="text-2xl font-bold text-orange-800">{stats.inProgress}</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                          <MdOutlineTrendingUp className="text-orange-700" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">Completed</p>
                          <p className="text-2xl font-bold text-emerald-800">{stats.completed}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-200 rounded-lg flex items-center justify-center">
                          <FiAward className="text-emerald-700" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Skills</p>
                          <p className="text-2xl font-bold text-blue-800">{profileData.skills?.length || 0}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                          <FaCode className="text-blue-700" />
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {/* Dynamic Sections - Only show if data exists */}
                  <div className="space-y-4">
                    {/* Personal Information */}
                    {(profileData.mobileNumber || profileData.address?.street || profileData.address?.city) && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                          <MdOutlinePerson className="text-blue-600 text-xl" />
                          <h3 className="font-semibold text-gray-800">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {profileData.mobileNumber && (
                            <div className="flex items-center gap-2 text-sm">
                              <FiPhone className="text-gray-400" />
                              <span className="text-gray-700">{profileData.mobileNumber}</span>
                            </div>
                          )}
                          {profileData.address?.street && (
                            <div className="flex items-center gap-2 text-sm col-span-2">
                              <FiMapPin className="text-gray-400" />
                              <span className="text-gray-700">
                                {profileData.address.street}
                                {profileData.address.city && `, ${profileData.address.city}`}
                                {profileData.address.state && `, ${profileData.address.state}`}
                                {profileData.address.country && `, ${profileData.address.country}`}
                                {profileData.address.pincode && ` - ${profileData.address.pincode}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {profileData.education && profileData.education.length > 0 && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                        <div className="flex items-center gap-3 mb-3">
                          <MdOutlineSchool className="text-purple-600 text-xl" />
                          <h3 className="font-semibold text-gray-800">Education</h3>
                        </div>
                        <div className="space-y-3">
                          {profileData.education.map((edu, index) => (
                            <div key={index} className="border-l-2 border-purple-300 pl-3">
                              <h4 className="font-medium text-gray-800">{edu.institution}</h4>
                              <p className="text-sm text-gray-600">{edu.degree} {edu.field && `- ${edu.field}`}</p>
                              {edu.startYear && (
                                <p className="text-xs text-gray-500">
                                  {edu.startYear} {edu.endYear ? `- ${edu.endYear}` : edu.current ? '- Present' : ''}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {profileData.skills && profileData.skills.length > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                        <div className="flex items-center gap-3 mb-3">
                          <FaCode className="text-green-600 text-xl" />
                          <h3 className="font-semibold text-gray-800">Skills</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profileData.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1.5 bg-white text-green-700 rounded-lg text-sm font-medium border border-green-200 shadow-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interests */}
                    {profileData.interests && profileData.interests.length > 0 && (
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-200">
                        <div className="flex items-center gap-3 mb-3">
                          <FaHeartSolid className="text-pink-600 text-xl" />
                          <h3 className="font-semibold text-gray-800">Interests</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profileData.interests.map((interest, index) => (
                            <span key={index} className="px-3 py-1.5 bg-white text-pink-700 rounded-lg text-sm font-medium border border-pink-200 shadow-sm flex items-center gap-1">
                              {getInterestIcon(interest)}
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    {Object.values(profileData.socialLinks || {}).some(v => v) && (
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-200">
                        <div className="flex items-center gap-3 mb-3">
                          <MdOutlineLink className="text-indigo-600 text-xl" />
                          <h3 className="font-semibold text-gray-800">Social Links</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {profileData.socialLinks?.linkedin && (
                            <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                               className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300">
                              <FaLinkedin className="text-blue-600" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                          {profileData.socialLinks?.github && (
                            <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors p-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300">
                              <FaGithub />
                              <span>GitHub</span>
                            </a>
                          )}
                          {profileData.socialLinks?.twitter && (
                            <a href={profileData.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-400 transition-colors p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300">
                              <FaTwitter className="text-blue-400" />
                              <span>Twitter</span>
                            </a>
                          )}
                          {profileData.socialLinks?.instagram && (
                            <a href={profileData.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-sm text-gray-700 hover:text-pink-600 transition-colors p-2 bg-white rounded-lg border border-gray-200 hover:border-pink-300">
                              <FaInstagram className="text-pink-600" />
                              <span>Instagram</span>
                            </a>
                          )}
                          {profileData.socialLinks?.facebook && (
                            <a href={profileData.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 transition-colors p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300">
                              <FaFacebook className="text-blue-700" />
                              <span>Facebook</span>
                            </a>
                          )}
                          {profileData.socialLinks?.youtube && (
                            <a href={profileData.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 transition-colors p-2 bg-white rounded-lg border border-gray-200 hover:border-red-300">
                              <FaYoutube className="text-red-600" />
                              <span>YouTube</span>
                            </a>
                          )}
                          {profileData.socialLinks?.website && (
                            <a href={profileData.socialLinks.website} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 transition-colors p-2 bg-white rounded-lg border border-gray-200 hover:border-green-300">
                              <FaGlobe className="text-green-600" />
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Empty State - If no data in any section */}
                    {!profileData.mobileNumber && 
                     !profileData.address?.street && 
                     profileData.education?.length === 0 && 
                     profileData.skills?.length === 0 && 
                     profileData.interests?.length === 0 && 
                     !Object.values(profileData.socialLinks || {}).some(v => v) && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">👋</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Your Profile!</h3>
                        <p className="text-gray-500 mb-4">Start adding your information to showcase yourself</p>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <FiEdit2 className="w-5 h-5" />
                          Add Your Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* My Learning Tab - Scrollable Course Grid */}
              {activeTab === 'learning' && (
                <div>
                  {/* Learning Stats */}
                  {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-700 font-medium">Total</p>
                          <p className="text-2xl font-bold text-green-800">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                          <FiBook className="text-green-700" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-700 font-medium">In Progress</p>
                          <p className="text-2xl font-bold text-orange-800">{stats.inProgress}</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                          <MdOutlineTrendingUp className="text-orange-700" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">Completed</p>
                          <p className="text-2xl font-bold text-emerald-800">{stats.completed}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-200 rounded-lg flex items-center justify-center">
                          <FiAward className="text-emerald-700" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Courses</p>
                          <p className="text-2xl font-bold text-blue-800">{enrollments.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                          <FiGrid className="text-blue-700" />
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {/* Course Grid - Scrollable */}
                  {learningLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                      <p className="text-gray-600 mt-3">Loading your courses...</p>
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No Courses Yet</h3>
                      <p className="text-gray-600 mb-4">Start your learning journey today!</p>
                      <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <FiBookOpen className="w-5 h-5" />
                        Browse Courses
                      </Link>
                    </div>
                  ) : (
                    <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {enrollments.map(renderCourseCard)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Mode - Keep the existing edit mode code
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors duration-200 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg border-l-4 border-green-500"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Profile
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              Edit Profile
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                <FiEdit2 className="inline mr-1" /> Editing
              </span>
            </h1>
            <p className="text-gray-600 mt-1">Update your personal information and preferences</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 font-medium">{message}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center space-x-2">
              <FiAlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiUser className="mr-2 text-green-500" />
              Profile Picture
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl overflow-hidden flex-shrink-0">
                {profileData.profilePicture ? (
                  <img 
                    src={profileData.profilePicture} 
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      const initials = getInitials(profileData.name || user?.name || 'User');
                      parent.innerHTML = `<span class="text-white text-4xl font-bold tracking-wider">${initials}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-white text-4xl font-bold tracking-wider">
                    {getInitials(profileData.name || user?.name || 'User')}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:cursor-pointer"
                />
                <p className="mt-2 text-xs text-gray-500">Upload a new profile picture (JPG, PNG, GIF)</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiUser className="mr-2 text-blue-500" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your mobile number"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-1">Bio / Short Description</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows="3"
                  maxLength="500"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 resize-none"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">{profileData.bio?.length || 0}/500 characters</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiMapPin className="mr-2 text-orange-500" />
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="Street address"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="City"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="State"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="Country"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="Pincode"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiLink className="mr-2 text-indigo-500" />
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaLinkedin className="mr-1.5 text-blue-600" /> LinkedIn
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.linkedin}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, linkedin: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaGithub className="mr-1.5" /> GitHub
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.github}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, github: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaTwitter className="mr-1.5 text-blue-400" /> Twitter / X
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.twitter}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, twitter: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaInstagram className="mr-1.5 text-pink-600" /> Instagram
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.instagram}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, instagram: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaFacebook className="mr-1.5 text-blue-700" /> Facebook
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.facebook}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, facebook: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FaYoutube className="mr-1.5 text-red-600" /> YouTube
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.youtube}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, youtube: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="https://youtube.com/@channel"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                  <FiGlobe className="mr-1.5 text-green-600" /> Personal Website
                </label>
                <input
                  type="url"
                  value={profileData.socialLinks.website}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, website: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-blue-500" />
              Educational Background
            </h3>
            
            {profileData.education.map((edu, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3 flex items-start justify-between border border-gray-200">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <FaGraduationCap className="mr-2 text-blue-500" />
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
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            ))}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <h4 className="font-medium text-gray-700 mb-3">Add Education</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Institution <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Degree <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="B.Sc., M.A., etc."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={newEducation.field}
                    onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={newEducation.description}
                    onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="Additional details"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Start Year</label>
                  <input
                    type="number"
                    value={newEducation.startYear}
                    onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="2020"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">End Year</label>
                  <input
                    type="number"
                    value={newEducation.endYear}
                    onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
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
                    <FiPlus className="mr-2" /> Add Education
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaCode className="mr-2 text-purple-500" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {profileData.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200 flex items-center">
                  <FaCode className="mr-1.5 text-purple-500" />
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-purple-500 hover:text-purple-700"
                  >
                    <FiX className="w-3 h-3" />
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
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="Add a skill (e.g., React, Python)"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center"
              >
                <FiPlus className="mr-1" /> Add
              </button>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaHeartSolid className="mr-2 text-orange-500" />
              Interests
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {profileData.interests.map((interest, index) => (
                <span key={index} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200 flex items-center">
                  <span className="mr-1.5">{getInterestIcon(interest)}</span>
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-2 text-orange-500 hover:text-orange-700"
                  >
                    <FiX className="w-3 h-3" />
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
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="Add an interest (e.g., Reading, Coding)"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                <FiPlus className="mr-1" /> Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center"
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