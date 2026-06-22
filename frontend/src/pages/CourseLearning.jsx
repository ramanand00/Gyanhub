// pages/CourseLearning.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CourseLearning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  const fetchCourseContent = async () => {
    try {
      const res = await API.get(`/api/courses/course-content/${courseId}`);
      setCourse(res.data.course);
      setEnrollment(res.data.enrollment);
      
      // Set first module and lesson
      if (res.data.course.modules && res.data.course.modules.length > 0) {
        const firstModule = res.data.course.modules[0];
        setSelectedModule(firstModule);
        if (firstModule.lessons && firstModule.lessons.length > 0) {
          setSelectedLesson(firstModule.lessons[0]);
        }
      }
    } catch (error) {
      setError('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async (lessonId) => {
    try {
      // Update lesson progress
      const moduleProgress = enrollment.moduleProgress?.find(
        mp => mp.moduleId === selectedModule._id
      );
      
      if (moduleProgress) {
        const lessonProgress = moduleProgress.lessonProgress?.find(
          lp => lp.lessonId === lessonId
        );
        
        if (lessonProgress) {
          lessonProgress.completed = true;
          lessonProgress.completedAt = new Date();
        }
        
        // Check if all lessons in module are completed
        const allLessonsCompleted = selectedModule.lessons.every(lesson => {
          const progress = moduleProgress.lessonProgress?.find(lp => lp.lessonId === lesson._id);
          return progress?.completed;
        });
        
        if (allLessonsCompleted && !moduleProgress.completed) {
          moduleProgress.completed = true;
          moduleProgress.completedAt = new Date();
        }
        
        await enrollment.save();
        setEnrollment({ ...enrollment });
      }
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const handleQuizSubmit = async () => {
    try {
      const res = await API.post(`/api/courses/quiz-attempt/${selectedLesson.quiz._id}`, {
        answers: quizAnswers
      });
      
      setQuizResult(res.data);
      
      if (res.data.passed) {
        // Mark quiz as completed
        await handleLessonComplete(selectedLesson._id);
      }
    } catch (error) {
      setError('Failed to submit quiz');
    }
  };

  const renderLessonContent = () => {
    if (!selectedLesson) return null;

    // If it's a quiz lesson
    if (selectedLesson.type === 'quiz' && selectedLesson.quiz) {
      return renderQuiz();
    }

    // Render video lesson
    if (selectedLesson.type === 'video') {
      return (
        <div className="space-y-4">
          {selectedLesson.content.videoUrl && (
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
              <video
                src={selectedLesson.content.videoUrl}
                controls
                className="w-full h-full"
                onEnded={() => handleLessonComplete(selectedLesson._id)}
              />
            </div>
          )}
          {selectedLesson.content.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
              <p className="text-gray-600 whitespace-pre-line">{selectedLesson.content.notes}</p>
            </div>
          )}
          <button
            onClick={() => handleLessonComplete(selectedLesson._id)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Mark as Complete
          </button>
        </div>
      );
    }

    // Render notes lesson
    if (selectedLesson.type === 'notes') {
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="prose max-w-none">
              {selectedLesson.content.notes.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700">{paragraph}</p>
              ))}
            </div>
          </div>
          <button
            onClick={() => handleLessonComplete(selectedLesson._id)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Mark as Complete
          </button>
        </div>
      );
    }

    // Render PDF lesson
    if (selectedLesson.type === 'pdf') {
      return (
        <div className="space-y-4">
          {selectedLesson.content.pdfUrl && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <iframe
                src={selectedLesson.content.pdfUrl}
                className="w-full h-96 rounded-lg"
                title="PDF Viewer"
              />
            </div>
          )}
          <button
            onClick={() => handleLessonComplete(selectedLesson._id)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Mark as Complete
          </button>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lesson content not available</p>
      </div>
    );
  };

  const renderQuiz = () => {
    const quiz = selectedLesson.quiz;
    
    if (quizResult) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${quizResult.passed ? 'text-green-500' : 'text-red-500'}`}>
              {quizResult.passed ? '🎉' : '😅'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {quizResult.passed ? 'Congratulations!' : 'Keep Learning!'}
            </h3>
            <p className="text-gray-600 mb-4">
              You scored {quizResult.score}% ({quizResult.correctAnswers}/{quizResult.totalQuestions})
            </p>
            {quizResult.passed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-700">You passed the quiz! You can now move to the next lesson.</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-700">You need {quiz.passingScore}% to pass. Please try again.</p>
              </div>
            )}
            <button
              onClick={() => {
                setQuizResult(null);
                setQuizAnswers([]);
                setShowQuiz(true);
              }}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {quizResult.passed ? 'Continue Learning' : 'Retry Quiz'}
            </button>
          </div>
        </div>
      );
    }

    if (!showQuiz) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">{quiz.title}</h3>
          <p className="text-gray-600 mb-4">{quiz.description}</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600">📝 {quiz.questions?.length || 0} questions</p>
            <p className="text-sm text-gray-600">✅ Passing score: {quiz.passingScore}%</p>
            {quiz.timeLimit > 0 && (
              <p className="text-sm text-gray-600">⏱️ Time limit: {quiz.timeLimit} minutes</p>
            )}
            <p className="text-sm text-gray-600">🔄 Max attempts: {quiz.maxAttempts}</p>
          </div>
          <button
            onClick={() => setShowQuiz(true)}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Start Quiz
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
          <button
            onClick={() => setShowQuiz(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          handleQuizSubmit();
        }}>
          <div className="space-y-6">
            {quiz.questions.map((question, qIndex) => (
              <div key={qIndex} className="border-b border-gray-100 pb-4">
                <p className="font-medium text-gray-800 mb-2">
                  {qIndex + 1}. {question.question}
                </p>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <label key={oIndex} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                        name={`question_${qIndex}`}
                        value={option.text}
                        onChange={(e) => {
                          const newAnswers = [...quizAnswers];
                          if (question.type === 'multiple') {
                            if (e.target.checked) {
                              newAnswers[qIndex] = [...(newAnswers[qIndex] || []), option.text];
                            } else {
                              newAnswers[qIndex] = (newAnswers[qIndex] || []).filter(a => a !== option.text);
                            }
                          } else {
                            newAnswers[qIndex] = option.text;
                          }
                          setQuizAnswers(newAnswers);
                        }}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="submit"
            className="w-full mt-6 px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Submit Quiz
          </button>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to enroll in this course to access the content.</p>
          <Link to={`/course/${courseId}`} className="mt-4 inline-block text-green-600 hover:text-green-700">
            View Course Details →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to={`/course/${courseId}`} className="text-gray-500 hover:text-gray-700">
                ← Back
              </Link>
              <h1 className="text-lg font-semibold text-gray-800 truncate">{course.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Progress: {enrollment?.progress || 0}%
              </span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${enrollment?.progress || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Modules */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-semibold text-gray-800 mb-4">Course Content</h3>
              
              {course.modules.map((module, index) => (
                <div key={module._id} className="mb-3">
                  <button
                    onClick={() => {
                      setSelectedModule(module);
                      if (module.lessons && module.lessons.length > 0) {
                        setSelectedLesson(module.lessons[0]);
                      }
                      setShowQuiz(false);
                      setQuizResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedModule?._id === module._id
                        ? 'bg-green-50 border border-green-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 text-sm">
                        Module {index + 1}
                      </span>
                      {module.quiz && (
                        <span className="text-xs text-purple-500">📝</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{module.title}</p>
                  </button>
                  
                  {selectedModule?._id === module._id && module.lessons && (
                    <div className="mt-2 ml-2 space-y-1">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson._id}
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setShowQuiz(false);
                            setQuizResult(null);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                            selectedLesson?._id === lesson._id
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <span>
                            {lesson.type === 'video' && '🎥'}
                            {lesson.type === 'notes' && '📝'}
                            {lesson.type === 'pdf' && '📄'}
                            {lesson.type === 'quiz' && '📝'}
                            {lesson.type === 'assignment' && '📋'}
                          </span>
                          <span className="truncate">{lesson.title}</span>
                          {lesson._id && (
                            <span className="ml-auto text-xs">
                              {lesson.completed ? '✅' : '⬜'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedLesson ? (
              <div>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedLesson.title}</h2>
                  {selectedLesson.description && (
                    <p className="text-gray-600">{selectedLesson.description}</p>
                  )}
                </div>
                
                {renderLessonContent()}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Lesson</h3>
                <p className="text-gray-600">Choose a lesson from the sidebar to start learning.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;