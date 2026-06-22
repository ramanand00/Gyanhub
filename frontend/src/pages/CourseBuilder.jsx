// pages/CourseBuilder.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Module form
  const [moduleData, setModuleData] = useState({
    title: '',
    description: '',
    order: 0,
  });

  // Lesson form
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    type: 'video',
    content: {
      videoUrl: '',
      notes: '',
      pdfUrl: '',
      duration: 0,
    },
    isFree: false,
    resources: [],
  });

  // Quiz form
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [],
    passingScore: 70,
    timeLimit: 0,
    maxAttempts: 3,
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    type: 'single',
    points: 1,
    explanation: '',
  });

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await API.get(`/api/courses/courses/${courseId}`);
      setCourse(res.data.course);
      setModules(res.data.course.modules || []);
    } catch (error) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  // Module functions
  const handleCreateModule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/api/courses/modules', {
        ...moduleData,
        courseId,
      });
      setModules([...modules, res.data.module]);
      setShowModuleForm(false);
      setModuleData({ title: '', description: '', order: 0 });
      setSuccess('Module created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create module');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    try {
      await API.delete(`/api/courses/modules/${moduleId}`);
      setModules(modules.filter(m => m._id !== moduleId));
      setSuccess('Module deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete module');
    }
  };

  // Lesson functions
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/api/courses/lessons', {
        ...lessonData,
        moduleId: selectedModule._id,
        order: selectedModule.lessons?.length || 0,
      });
      
      // Update module with new lesson
      const updatedModule = { ...selectedModule, lessons: [...(selectedModule.lessons || []), res.data.lesson] };
      setSelectedModule(updatedModule);
      setModules(modules.map(m => m._id === updatedModule._id ? updatedModule : m));
      
      setShowLessonForm(false);
      setLessonData({
        title: '',
        description: '',
        type: 'video',
        content: { videoUrl: '', notes: '', pdfUrl: '', duration: 0 },
        isFree: false,
        resources: [],
      });
      setSuccess('Lesson created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await API.delete(`/api/courses/lessons/${lessonId}`);
      const updatedModule = {
        ...selectedModule,
        lessons: selectedModule.lessons.filter(l => l._id !== lessonId)
      };
      setSelectedModule(updatedModule);
      setModules(modules.map(m => m._id === updatedModule._id ? updatedModule : m));
      setSuccess('Lesson deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete lesson');
    }
  };

  // Handle video upload
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLessonData({
          ...lessonData,
          content: { ...lessonData.content, videoUrl: reader.result }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Quiz functions
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/api/courses/quizzes', {
        ...quizData,
        moduleId: selectedModule._id,
      });
      
      const updatedModule = { ...selectedModule, quiz: res.data.quiz };
      setSelectedModule(updatedModule);
      setModules(modules.map(m => m._id === updatedModule._id ? updatedModule : m));
      
      setShowQuizForm(false);
      setQuizData({
        title: '',
        description: '',
        questions: [],
        passingScore: 70,
        timeLimit: 0,
        maxAttempts: 3,
      });
      setSuccess('Quiz created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion]
    });
    setNewQuestion({
      question: '',
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
      type: 'single',
      points: 1,
      explanation: '',
    });
  };

  const removeQuestion = (index) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.filter((_, i) => i !== index)
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].options[oIndex] = { 
      ...updatedQuestions[qIndex].options[oIndex], 
      [field]: value 
    };
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].options.push({ text: '', isCorrect: false });
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const removeOption = (qIndex, oIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  // Publish course
  const handlePublishCourse = async () => {
    if (!confirm('Publish this course? It will be visible to all users.')) return;
    setLoading(true);
    try {
      await API.put(`/api/courses/courses/${courseId}/publish`);
      setSuccess('Course published successfully!');
      fetchCourse();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to publish course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{course?.title}</h1>
            <p className="text-gray-600">Course Builder</p>
          </div>
          <div className="flex space-x-3">
            {course?.status === 'draft' && (
              <button
                onClick={handlePublishCourse}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-colors"
              >
                Publish Course
              </button>
            )}
            <button
              onClick={() => navigate('/my-courses')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Modules */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Modules</h3>
                <button
                  onClick={() => setShowModuleForm(!showModuleForm)}
                  className="text-green-600 hover:text-green-700"
                >
                  + Add Module
                </button>
              </div>

              {showModuleForm && (
                <form onSubmit={handleCreateModule} className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Module Title"
                    value={moduleData.title}
                    onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <textarea
                    placeholder="Module Description"
                    value={moduleData.description}
                    onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="2"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModuleForm(false)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {modules.map((module, index) => (
                  <div
                    key={module._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedModule?._id === module._id
                        ? 'bg-green-100 border border-green-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedModule(module)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Module {index + 1}: {module.title}</p>
                        <p className="text-sm text-gray-500">{module.lessons?.length || 0} lessons</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModule(module._id);
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {modules.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No modules yet. Add your first module!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Lessons & Quiz */}
          <div className="lg:col-span-2">
            {selectedModule ? (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{selectedModule.title}</h3>
                    <p className="text-gray-600">{selectedModule.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowLessonForm(!showLessonForm)}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      + Add Lesson
                    </button>
                    <button
                      onClick={() => setShowQuizForm(!showQuizForm)}
                      className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                    >
                      + Add Quiz
                    </button>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="space-y-3 mb-6">
                  {selectedModule.lessons?.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400">
                          {lesson.type === 'video' && '🎥'}
                          {lesson.type === 'notes' && '📝'}
                          {lesson.type === 'pdf' && '📄'}
                          {lesson.type === 'quiz' && '📝'}
                          {lesson.type === 'assignment' && '📋'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">{lesson.title}</p>
                          <p className="text-sm text-gray-500">{lesson.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson._id);
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(!selectedModule.lessons || selectedModule.lessons.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No lessons yet. Add your first lesson!</p>
                  )}
                </div>

                {/* Quiz Section */}
                {selectedModule.quiz && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-purple-800">📝 {selectedModule.quiz.title}</h4>
                        <p className="text-sm text-purple-600">
                          {selectedModule.quiz.questions?.length || 0} questions • 
                          Passing score: {selectedModule.quiz.passingScore}% • 
                          Max attempts: {selectedModule.quiz.maxAttempts}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Delete this quiz?')) {
                            // Delete quiz logic
                          }
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* Lesson Form */}
                {showLessonForm && (
                  <form onSubmit={handleCreateLesson} className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Create New Lesson</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title *</label>
                        <input
                          type="text"
                          value={lessonData.title}
                          onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={lessonData.description}
                          onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows="2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Type</label>
                        <select
                          value={lessonData.type}
                          onChange={(e) => setLessonData({ ...lessonData, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="video">Video</option>
                          <option value="notes">Notes</option>
                          <option value="pdf">PDF</option>
                          <option value="quiz">Quiz</option>
                          <option value="assignment">Assignment</option>
                        </select>
                      </div>

                      {lessonData.type === 'video' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Video</label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="w-full"
                          />
                          {lessonData.content.videoUrl && (
                            <div className="mt-2">
                              <video 
                                src={lessonData.content.videoUrl} 
                                controls 
                                className="w-full max-h-48 rounded-lg"
                              />
                            </div>
                          )}
                          <input
                            type="text"
                            placeholder="Or enter video URL"
                            value={lessonData.content.videoUrl}
                            onChange={(e) => setLessonData({
                              ...lessonData,
                              content: { ...lessonData.content, videoUrl: e.target.value }
                            })}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            type="number"
                            placeholder="Duration (minutes)"
                            value={lessonData.content.duration}
                            onChange={(e) => setLessonData({
                              ...lessonData,
                              content: { ...lessonData.content, duration: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      )}

                      {lessonData.type === 'notes' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes Content</label>
                          <textarea
                            value={lessonData.content.notes}
                            onChange={(e) => setLessonData({
                              ...lessonData,
                              content: { ...lessonData.content, notes: e.target.value }
                            })}
                            rows="6"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Write your notes here..."
                          />
                        </div>
                      )}

                      {lessonData.type === 'pdf' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PDF URL</label>
                          <input
                            type="url"
                            value={lessonData.content.pdfUrl}
                            onChange={(e) => setLessonData({
                              ...lessonData,
                              content: { ...lessonData.content, pdfUrl: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="https://example.com/document.pdf"
                          />
                        </div>
                      )}

                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={lessonData.isFree}
                            onChange={(e) => setLessonData({ ...lessonData, isFree: e.target.checked })}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">Make this lesson free (preview)</span>
                        </label>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Create Lesson
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLessonForm(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Quiz Form */}
                {showQuizForm && (
                  <form onSubmit={handleCreateQuiz} className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Create Quiz</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title *</label>
                        <input
                          type="text"
                          value={quizData.title}
                          onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={quizData.description}
                          onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows="2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                          <input
                            type="number"
                            value={quizData.passingScore}
                            onChange={(e) => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) || 70 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                          <input
                            type="number"
                            value={quizData.timeLimit}
                            onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            min="0"
                          />
                        </div>
                      </div>

                      {/* Questions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
                        
                        {quizData.questions.map((q, qIndex) => (
                          <div key={qIndex} className="p-3 bg-white rounded-lg mb-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-700">Question {qIndex + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="text-red-400 hover:text-red-600"
                              >
                                ×
                              </button>
                            </div>
                            
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Enter question"
                            />
                            
                            <select
                              value={q.type}
                              onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="single">Single Choice</option>
                              <option value="multiple">Multiple Choice</option>
                              <option value="truefalse">True/False</option>
                            </select>
                            
                            <div className="space-y-1">
                              {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center space-x-2">
                                  <input
                                    type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                                    checked={opt.isCorrect}
                                    onChange={(e) => {
                                      const newOpts = q.options.map((o, i) => ({
                                        ...o,
                                        isCorrect: q.type === 'single' ? i === oIndex : 
                                          q.type === 'multiple' ? (e.target.checked ? true : false) :
                                          i === oIndex
                                      }));
                                      updateQuestion(qIndex, 'options', newOpts);
                                    }}
                                    className="w-4 h-4 text-green-600"
                                  />
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                    className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder={`Option ${oIndex + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => addOption(qIndex)}
                              className="mt-2 text-sm text-green-600 hover:text-green-700"
                            >
                              + Add Option
                            </button>
                            
                            <input
                              type="text"
                              value={q.explanation}
                              onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Explanation (optional)"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Add Question Button */}
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                      >
                        + Add Question
                      </button>

                      <div className="flex space-x-2 mt-4">
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          Create Quiz
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQuizForm(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Module</h3>
                <p className="text-gray-600">Choose a module from the left sidebar to start adding lessons and quizzes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder;