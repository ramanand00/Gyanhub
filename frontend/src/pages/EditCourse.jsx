// pages/EditCourse.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    subCategory: '',
    level: 'Beginner',
    price: 0,
    discountPrice: 0,
    thumbnail: '',
    learningOutcomes: [],
    prerequisites: [],
    targetAudience: [],
    language: 'English',
    tags: [],
    whatYouWillLearn: [],
    requirements: [],
  });

  const [newOutcome, setNewOutcome] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

  const categories = [
    'Development', 'Design', 'Business', 'Marketing', 
    'Data Science', 'AI/ML', 'Cloud', 'DevOps', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await API.get(`/api/courses/courses/${courseId}`);
      const course = res.data.course;
      setCourseData({
        title: course.title || '',
        description: course.description || '',
        shortDescription: course.shortDescription || '',
        category: course.category || '',
        subCategory: course.subCategory || '',
        level: course.level || 'Beginner',
        price: course.price || 0,
        discountPrice: course.discountPrice || 0,
        thumbnail: course.thumbnail || '',
        learningOutcomes: course.learningOutcomes || [],
        prerequisites: course.prerequisites || [],
        targetAudience: course.targetAudience || [],
        language: course.language || 'English',
        tags: course.tags || [],
        whatYouWillLearn: course.whatYouWillLearn || [],
        requirements: course.requirements || [],
      });
    } catch (error) {
      setError('Failed to load course data');
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseData({ ...courseData, thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = (field, value, setter) => {
    if (value.trim()) {
      setCourseData({ 
        ...courseData, 
        [field]: [...courseData[field], value.trim()] 
      });
      setter('');
    }
  };

  const removeItem = (field, index) => {
    setCourseData({
      ...courseData,
      [field]: courseData[field].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await API.put(`/api/courses/courses/${courseId}`, courseData);
      setSuccess('Course updated successfully!');
      setTimeout(() => {
        navigate('/my-courses');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Edit Course</h1>
            <p className="text-gray-600">Update your course details</p>
          </div>
          <button
            onClick={() => navigate('/my-courses')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Courses
          </button>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Complete Web Development Bootcamp"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Full Description *</label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Detailed description of your course..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={courseData.shortDescription}
                  onChange={handleInputChange}
                  maxLength="200"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Brief summary (max 200 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">{courseData.shortDescription.length}/200</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Category *</label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Sub Category</label>
                  <input
                    type="text"
                    name="subCategory"
                    value={courseData.subCategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Frontend Development"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Level *</label>
                <select
                  name="level"
                  value={courseData.level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Language</label>
                <input
                  type="text"
                  name="language"
                  value={courseData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., English"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Price (NPR)</label>
                <input
                  type="number"
                  name="price"
                  value={courseData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0 for free"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Discount Price (NPR)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={courseData.discountPrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Discounted price"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Thumbnail</h3>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {courseData.thumbnail && (
                <img 
                  src={courseData.thumbnail} 
                  alt="Course thumbnail" 
                  className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                />
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="mt-1 text-xs text-gray-500">Recommended size: 1200x630 pixels</p>
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What You'll Learn</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {courseData.whatYouWillLearn.map((item, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem('whatYouWillLearn', index)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('whatYouWillLearn', newRequirement, setNewRequirement)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="What will students learn?"
              />
              <button
                type="button"
                onClick={() => addItem('whatYouWillLearn', newRequirement, setNewRequirement)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Outcomes</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {courseData.learningOutcomes.map((outcome, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center">
                  {outcome}
                  <button
                    type="button"
                    onClick={() => removeItem('learningOutcomes', index)}
                    className="ml-2 text-green-500 hover:text-green-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('learningOutcomes', newOutcome, setNewOutcome)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add learning outcome"
              />
              <button
                type="button"
                onClick={() => addItem('learningOutcomes', newOutcome, setNewOutcome)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Prerequisites</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {courseData.prerequisites.map((prereq, index) => (
                <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center">
                  {prereq}
                  <button
                    type="button"
                    onClick={() => removeItem('prerequisites', index)}
                    className="ml-2 text-orange-500 hover:text-orange-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newPrerequisite}
                onChange={(e) => setNewPrerequisite(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('prerequisites', newPrerequisite, setNewPrerequisite)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="What should students know before taking this course?"
              />
              <button
                type="button"
                onClick={() => addItem('prerequisites', newPrerequisite, setNewPrerequisite)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {courseData.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeItem('tags', index)}
                    className="ml-2 text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('tags', newTag, setNewTag)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={() => addItem('tags', newTag, setNewTag)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Requirements</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {courseData.requirements.map((req, index) => (
                <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center">
                  {req}
                  <button
                    type="button"
                    onClick={() => removeItem('requirements', index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('requirements', newRequirement, setNewRequirement)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add a requirement"
              />
              <button
                type="button"
                onClick={() => addItem('requirements', newRequirement, setNewRequirement)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-courses')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;