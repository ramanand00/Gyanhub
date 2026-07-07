// src/pages/admin/BookOverview.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';
import { FiX, FiPlus, FiTrash2, FiSave, FiUpload, FiCheck, FiFile, FiEye } from 'react-icons/fi';

const BookOverview = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('basic');
  
  const [overview, setOverview] = useState({
    university: 'Tribhuvan University',
    programType: 'Institute of Science and Technology',
    program: 'Bachelor of Science in Computer Science and Information Technology',
    courseTitle: '',
    courseNumber: '',
    semester: '',
    natureOfCourse: 'Theory + Lab',
    fullMarks: { theory: 60, practical: 20, internal: 20 },
    passMarks: { theory: 24, practical: 8, internal: 8 },
    creditHours: 3,
    courseDescription: '',
    courseObjectives: [],
    courseContents: [],
    questionsBank: [],
    pastQuestions: [],
    practicalSheets: [],
    resources: [],
  });

  useEffect(() => {
    fetchBookOverview();
  }, [bookId]);

  const fetchBookOverview = async () => {
    try {
      setLoading(true);
      
      // Fetch book details
      const bookRes = await API.get(`/api/admin/books/${bookId}`);
      setBook(bookRes.data.book);
      
      // Fetch overview
      try {
        const res = await API.get(`/api/admin/books/${bookId}/overview`);
        if (res.data.overview) {
          setOverview(prev => ({
            ...prev,
            ...res.data.overview,
          }));
        }
      } catch (err) {
        console.log('No existing overview found, using defaults');
      }
    } catch (error) {
      console.error('Failed to fetch book:', error);
      alert('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  // ===== PDF UPLOAD FUNCTION =====
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePdfUpload = async (file, type, index, field) => {
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB');
      return;
    }

    setUploadingPdf(true);
    setUploadProgress(0);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Send to API
      const response = await API.post('/api/admin/upload-pdf', {
        file: base64,
        folder: `book_overview/${type}`,
      });

      if (response.data.success) {
        const pdfUrl = response.data.url;
        
        // Update the specific field
        if (type === 'pastQuestions') {
          const updatedPastQuestions = [...overview.pastQuestions];
          updatedPastQuestions[index] = { 
            ...updatedPastQuestions[index], 
            [field]: pdfUrl 
          };
          setOverview(prev => ({ ...prev, pastQuestions: updatedPastQuestions }));
        } else if (type === 'practicalSheets') {
          const updatedSheets = [...overview.practicalSheets];
          updatedSheets[index] = { 
            ...updatedSheets[index], 
            [field]: pdfUrl 
          };
          setOverview(prev => ({ ...prev, practicalSheets: updatedSheets }));
        }
        
        alert('PDF uploaded successfully!');
      } else {
        alert(response.data.message || 'Failed to upload PDF');
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      alert(error.response?.data?.message || 'Failed to upload PDF');
    } finally {
      setUploadingPdf(false);
      setUploadProgress(0);
    }
  };

  // ===== SAVE FUNCTION =====
  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/api/admin/books/${bookId}/overview`, { overview });
      alert('Overview saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert(error.response?.data?.message || 'Failed to save overview');
    } finally {
      setSaving(false);
    }
  };

  // ===== BASIC INFO HANDLERS =====
  const handleBasicChange = (field, value) => {
    setOverview(prev => ({ ...prev, [field]: value }));
  };

  const handleMarksChange = (type, field, value) => {
    setOverview(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: parseInt(value) || 0,
      },
    }));
  };

  // ===== COURSE OBJECTIVES HANDLERS =====
  const addObjective = () => {
    setOverview(prev => ({
      ...prev,
      courseObjectives: [...prev.courseObjectives, ''],
    }));
  };

  const updateObjective = (index, value) => {
    const newObjectives = [...overview.courseObjectives];
    newObjectives[index] = value;
    setOverview(prev => ({ ...prev, courseObjectives: newObjectives }));
  };

  const removeObjective = (index) => {
    setOverview(prev => ({
      ...prev,
      courseObjectives: prev.courseObjectives.filter((_, i) => i !== index),
    }));
  };

  // ===== COURSE CONTENTS HANDLERS =====
  const addContent = () => {
    setOverview(prev => ({
      ...prev,
      courseContents: [...prev.courseContents, { 
        chapterNumber: prev.courseContents.length + 1, 
        chapterName: '', 
        creditHours: 0 
      }],
    }));
  };

  const updateContent = (index, field, value) => {
    const newContents = [...overview.courseContents];
    newContents[index] = { 
      ...newContents[index], 
      [field]: field === 'creditHours' ? parseFloat(value) || 0 : value 
    };
    setOverview(prev => ({ ...prev, courseContents: newContents }));
  };

  const removeContent = (index) => {
    setOverview(prev => ({
      ...prev,
      courseContents: prev.courseContents.filter((_, i) => i !== index),
    }));
  };

  // ===== QUESTIONS BANK HANDLERS =====
  const addQuestion = () => {
    setOverview(prev => ({
      ...prev,
      questionsBank: [...prev.questionsBank, {
        chapter: '',
        question: '',
        type: 'Theory',
        difficulty: 'Medium',
        answer: '',
        marks: 0,
        year: new Date().getFullYear(),
        isSolved: false,
      }],
    }));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...overview.questionsBank];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setOverview(prev => ({ ...prev, questionsBank: newQuestions }));
  };

  const removeQuestion = (index) => {
    setOverview(prev => ({
      ...prev,
      questionsBank: prev.questionsBank.filter((_, i) => i !== index),
    }));
  };

  // ===== PAST QUESTIONS HANDLERS =====
  const addPastQuestion = () => {
    setOverview(prev => ({
      ...prev,
      pastQuestions: [...prev.pastQuestions, {
        year: new Date().getFullYear(),
        semester: 'Fall',
        title: '',
        questions: 0,
        solved: false,
        pdfUrl: '',
        description: '',
      }],
    }));
  };

  const updatePastQuestion = (index, field, value) => {
    const newPast = [...overview.pastQuestions];
    newPast[index] = { ...newPast[index], [field]: value };
    setOverview(prev => ({ ...prev, pastQuestions: newPast }));
  };

  const removePastQuestion = (index) => {
    setOverview(prev => ({
      ...prev,
      pastQuestions: prev.pastQuestions.filter((_, i) => i !== index),
    }));
  };

  // ===== PRACTICAL SHEETS HANDLERS =====
  const addPracticalSheet = () => {
    setOverview(prev => ({
      ...prev,
      practicalSheets: [...prev.practicalSheets, {
        title: '',
        description: '',
        completed: false,
        labNumber: prev.practicalSheets.length + 1,
        pdfUrl: '',
        objectives: [],
        requirements: [],
      }],
    }));
  };

  const updatePracticalSheet = (index, field, value) => {
    const newSheets = [...overview.practicalSheets];
    newSheets[index] = { ...newSheets[index], [field]: value };
    setOverview(prev => ({ ...prev, practicalSheets: newSheets }));
  };

  const removePracticalSheet = (index) => {
    setOverview(prev => ({
      ...prev,
      practicalSheets: prev.practicalSheets.filter((_, i) => i !== index),
    }));
  };

  // ===== PDF UPLOAD HANDLERS =====
  const handlePastQuestionPdfUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      handlePdfUpload(file, 'pastQuestions', index, 'pdfUrl');
    }
    e.target.value = '';
  };

  const handlePracticalSheetPdfUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      handlePdfUpload(file, 'practicalSheets', index, 'pdfUrl');
    }
    e.target.value = '';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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
            <button
              onClick={() => navigate(`/admin/books/${bookId}/chapters`)}
              className="text-gray-400 hover:text-white transition-colors mb-2 flex items-center gap-1"
            >
              ← Back to Chapters
            </button>
            <h1 className="text-3xl font-bold text-white">
              Book Overview: {book?.title}
            </h1>
            <p className="text-gray-400">Manage all course details, questions, and resources</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-1 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {[
              { id: 'basic', label: 'Basic Info' },
              { id: 'contents', label: 'Course Contents' },
              { id: 'questions', label: 'Questions Bank' },
              { id: 'past', label: 'Past Questions' },
              { id: 'practical', label: 'Practical Sheets' },
              { id: 'resources', label: 'Resources' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          {/* ==================== BASIC INFO ==================== */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">University</label>
                  <input
                    type="text"
                    value={overview.university || ''}
                    onChange={(e) => handleBasicChange('university', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Program Type</label>
                  <input
                    type="text"
                    value={overview.programType || ''}
                    onChange={(e) => handleBasicChange('programType', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Program</label>
                  <input
                    type="text"
                    value={overview.program || ''}
                    onChange={(e) => handleBasicChange('program', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Course Title</label>
                  <input
                    type="text"
                    value={overview.courseTitle || ''}
                    onChange={(e) => handleBasicChange('courseTitle', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Introduction to Information Technology"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Course Number</label>
                  <input
                    type="text"
                    value={overview.courseNumber || ''}
                    onChange={(e) => handleBasicChange('courseNumber', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., CSC114"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Semester</label>
                  <input
                    type="text"
                    value={overview.semester || ''}
                    onChange={(e) => handleBasicChange('semester', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., First Semester"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Nature of Course</label>
                  <input
                    type="text"
                    value={overview.natureOfCourse || ''}
                    onChange={(e) => handleBasicChange('natureOfCourse', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Theory + Lab"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Credit Hours</label>
                  <input
                    type="number"
                    value={overview.creditHours || 0}
                    onChange={(e) => handleBasicChange('creditHours', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Marks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Full Marks</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-300 text-xs mb-1">Theory</label>
                      <input
                        type="number"
                        value={overview.fullMarks?.theory || 0}
                        onChange={(e) => handleMarksChange('fullMarks', 'theory', e.target.value)}
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs mb-1">Practical</label>
                      <input
                        type="number"
                        value={overview.fullMarks?.practical || 0}
                        onChange={(e) => handleMarksChange('fullMarks', 'practical', e.target.value)}
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs mb-1">Internal</label>
                      <input
                        type="number"
                        value={overview.fullMarks?.internal || 0}
                        onChange={(e) => handleMarksChange('fullMarks', 'internal', e.target.value)}
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Pass Marks</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-300 text-xs mb-1">Theory</label>
                      <input
                        type="number"
                        value={overview.passMarks?.theory || 0}
                        onChange={(e) => handleMarksChange('passMarks', 'theory', e.target.value)}
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs mb-1">Practical</label>
                      <input
                        type="number"
                        value={overview.passMarks?.practical || 0}
                        onChange={(e) => handleMarksChange('passMarks', 'practical', e.target.value)}
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs mb-1">Internal</label>
                      <input
                        type="number"
                        value={overview.passMarks?.internal || 0}
                        onChange={(e) => handleMarksChange('passMarks', 'internal', e.target.value)}
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Course Description</label>
                <textarea
                  value={overview.courseDescription || ''}
                  onChange={(e) => handleBasicChange('courseDescription', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Detailed course description..."
                />
              </div>

              {/* Course Objectives */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Course Objectives</label>
                {overview.courseObjectives?.map((obj, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={obj || ''}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={`Objective ${index + 1}`}
                    />
                    <button
                      onClick={() => removeObjective(index)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addObjective}
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Objective
                </button>
              </div>
            </div>
          )}

          {/* ==================== COURSE CONTENTS ==================== */}
          {activeSection === 'contents' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Course Contents</h3>
                <button
                  onClick={addContent}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Chapter
                </button>
              </div>

              <div className="space-y-3">
                {overview.courseContents?.map((content, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Chapter Number</label>
                        <input
                          type="number"
                          value={content.chapterNumber || 0}
                          onChange={(e) => updateContent(index, 'chapterNumber', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Chapter Name</label>
                        <input
                          type="text"
                          value={content.chapterName || ''}
                          onChange={(e) => updateContent(index, 'chapterName', e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Chapter name"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-gray-300 text-xs mb-1">Credit Hours</label>
                          <input
                            type="number"
                            value={content.creditHours || 0}
                            onChange={(e) => updateContent(index, 'creditHours', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            step="0.5"
                          />
                        </div>
                        <button
                          onClick={() => removeContent(index)}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== QUESTIONS BANK ==================== */}
          {activeSection === 'questions' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Questions Bank</h3>
                <button
                  onClick={addQuestion}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              <div className="space-y-4">
                {overview.questionsBank?.map((q, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Chapter</label>
                        <input
                          type="number"
                          value={q.chapter || ''}
                          onChange={(e) => updateQuestion(index, 'chapter', parseInt(e.target.value) || '')}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Type</label>
                        <select
                          value={q.type || 'Theory'}
                          onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Theory">Theory</option>
                          <option value="Numerical">Numerical</option>
                          <option value="Application">Application</option>
                          <option value="Multiple Choice">Multiple Choice</option>
                          <option value="Short Answer">Short Answer</option>
                          <option value="Long Answer">Long Answer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Difficulty</label>
                        <select
                          value={q.difficulty || 'Medium'}
                          onChange={(e) => updateQuestion(index, 'difficulty', e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                          <option value="Very Hard">Very Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Marks</label>
                        <input
                          type="number"
                          value={q.marks || 0}
                          onChange={(e) => updateQuestion(index, 'marks', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 text-xs mb-1">Question</label>
                        <input
                          type="text"
                          value={q.question || ''}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter question"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 text-xs mb-1">Answer (Optional)</label>
                        <textarea
                          value={q.answer || ''}
                          onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter answer"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => removeQuestion(index)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== PAST QUESTIONS ==================== */}
          {activeSection === 'past' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Past Questions</h3>
                <button
                  onClick={addPastQuestion}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Past Question
                </button>
              </div>

              <div className="space-y-4">
                {overview.pastQuestions?.map((pq, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Year</label>
                        <input
                          type="number"
                          value={pq.year || new Date().getFullYear()}
                          onChange={(e) => updatePastQuestion(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Semester</label>
                        <select
                          value={pq.semester || 'Fall'}
                          onChange={(e) => updatePastQuestion(index, 'semester', e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Spring">Spring</option>
                          <option value="Summer">Summer</option>
                          <option value="Fall">Fall</option>
                          <option value="Winter">Winter</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 text-xs mb-1">Title</label>
                        <input
                          type="text"
                          value={pq.title || ''}
                          onChange={(e) => updatePastQuestion(index, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="e.g., Final Examination"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Number of Questions</label>
                        <input
                          type="number"
                          value={pq.questions || 0}
                          onChange={(e) => updatePastQuestion(index, 'questions', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-gray-300 text-sm">
                          <input
                            type="checkbox"
                            checked={pq.solved || false}
                            onChange={(e) => updatePastQuestion(index, 'solved', e.target.checked)}
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                          />
                          Solved
                        </label>
                      </div>
                      
                      {/* PDF Upload Section */}
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 text-xs mb-1">PDF Upload</label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          {pq.pdfUrl ? (
                            <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg flex-wrap">
                              <FiCheck className="w-4 h-4" />
                              <span className="text-sm truncate max-w-[150px] sm:max-w-[200px]">
                                {pq.pdfUrl.split('/').pop() || 'PDF uploaded'}
                              </span>
                              <a
                                href={pq.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                              >
                                <FiEye className="w-3 h-3" />
                                View
                              </a>
                              <button
                                onClick={() => {
                                  updatePastQuestion(index, 'pdfUrl', '');
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <label className={`flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors ${
                                uploadingPdf ? 'opacity-50 cursor-not-allowed' : ''
                              }`}>
                                <FiUpload className="w-4 h-4 text-orange-400" />
                                <span className="text-sm text-gray-300">
                                  {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => handlePastQuestionPdfUpload(index, e)}
                                  className="hidden"
                                  disabled={uploadingPdf}
                                />
                              </label>
                              {uploadingPdf && (
                                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-400">Upload PDF (max 20MB)</p>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-gray-300 text-xs mb-1">Description</label>
                        <input
                          type="text"
                          value={pq.description || ''}
                          onChange={(e) => updatePastQuestion(index, 'description', e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Brief description"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => removePastQuestion(index)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== PRACTICAL SHEETS ==================== */}
          {activeSection === 'practical' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Practical Sheets</h3>
                <button
                  onClick={addPracticalSheet}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Practical Sheet
                </button>
              </div>

              <div className="space-y-4">
                {overview.practicalSheets?.map((sheet, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Lab Number</label>
                        <input
                          type="number"
                          value={sheet.labNumber || index + 1}
                          onChange={(e) => updatePracticalSheet(index, 'labNumber', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-xs mb-1">Title</label>
                        <input
                          type="text"
                          value={sheet.title || ''}
                          onChange={(e) => updatePracticalSheet(index, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="e.g., Lab Sheet 1: Introduction"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 text-xs mb-1">Description</label>
                        <input
                          type="text"
                          value={sheet.description || ''}
                          onChange={(e) => updatePracticalSheet(index, 'description', e.target.value)}
                          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Brief description"
                        />
                      </div>
                      
                      {/* PDF Upload Section */}
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 text-xs mb-1">PDF Upload</label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          {sheet.pdfUrl ? (
                            <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg flex-wrap">
                              <FiCheck className="w-4 h-4" />
                              <span className="text-sm truncate max-w-[150px] sm:max-w-[200px]">
                                {sheet.pdfUrl.split('/').pop() || 'PDF uploaded'}
                              </span>
                              <a
                                href={sheet.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                              >
                                <FiEye className="w-3 h-3" />
                                View
                              </a>
                              <button
                                onClick={() => {
                                  updatePracticalSheet(index, 'pdfUrl', '');
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <label className={`flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors ${
                                uploadingPdf ? 'opacity-50 cursor-not-allowed' : ''
                              }`}>
                                <FiUpload className="w-4 h-4 text-orange-400" />
                                <span className="text-sm text-gray-300">
                                  {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => handlePracticalSheetPdfUpload(index, e)}
                                  className="hidden"
                                  disabled={uploadingPdf}
                                />
                              </label>
                              {uploadingPdf && (
                                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-400">Upload PDF (max 20MB)</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 text-gray-300 text-sm">
                          <input
                            type="checkbox"
                            checked={sheet.completed || false}
                            onChange={(e) => updatePracticalSheet(index, 'completed', e.target.checked)}
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                          />
                          Completed
                        </label>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => removePracticalSheet(index)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== RESOURCES ==================== */}
          {activeSection === 'resources' && (
            <div>
              <h3 className="text-white font-medium mb-4">Additional Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '📄', title: 'Sample Questions', desc: 'Practice questions for each chapter' },
                  { icon: '🎬', title: 'Video Lectures', desc: 'Recorded video lessons' },
                  { icon: '📚', title: 'Reference Materials', desc: 'Additional reading materials' },
                  { icon: '✏️', title: 'Practice Exercises', desc: 'Hands-on practice exercises' },
                ].map((resource, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-600/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{resource.icon}</span>
                      <div>
                        <h4 className="text-white font-medium">{resource.title}</h4>
                        <p className="text-gray-400 text-sm">{resource.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default BookOverview;