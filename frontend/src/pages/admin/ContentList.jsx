// pages/admin/ContentList.jsx
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

const ContentList = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form-based content structure (no HTML needed)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    isPublished: true,
    // For FAQ
    question: '',
    answer: '',
    // For Documentation
    introduction: '',
    steps: [{ title: '', description: '' }],
    // For Policy
    sections: [{ title: '', content: '' }],
    // For Announcement
    announcement: '',
    // For Help Article
    problem: '',
    solution: '',
    steps: [{ title: '', description: '' }],
  });
  
  const [saving, setSaving] = useState(false);

  const contentTypes = {
    faq: { 
      label: 'FAQs', 
      icon: '❓', 
      color: 'from-blue-500 to-blue-600',
      fields: ['question', 'answer'],
      template: {
        question: 'What is your question?',
        answer: 'Write your answer here...'
      }
    },
    documentation: { 
      label: 'Documentation', 
      icon: '📖', 
      color: 'from-green-500 to-green-600',
      fields: ['introduction', 'steps'],
      template: {
        introduction: 'Introduction to this guide...',
        steps: [{ title: 'Step 1', description: 'Description of step 1' }]
      }
    },
    policy: { 
      label: 'Policies', 
      icon: '📄', 
      color: 'from-purple-500 to-purple-600',
      fields: ['sections'],
      template: {
        sections: [{ title: 'Section 1', content: 'Content of section 1' }]
      }
    },
    announcement: { 
      label: 'Announcements', 
      icon: '📢', 
      color: 'from-orange-500 to-orange-600',
      fields: ['announcement'],
      template: {
        announcement: 'Your announcement message here...'
      }
    },
    help: { 
      label: 'Help Articles', 
      icon: '💡', 
      color: 'from-pink-500 to-pink-600',
      fields: ['problem', 'solution', 'steps'],
      template: {
        problem: 'What is the problem?',
        solution: 'Solution description...',
        steps: [{ title: 'Step 1', description: 'Description of step 1' }]
      }
    },
  };

  const typeInfo = contentTypes[type] || contentTypes.faq;

  useEffect(() => {
    fetchItems();
  }, [type]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/admin/content', {
        params: { type, search: searchTerm || undefined },
      });
      setItems(res.data.content || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      alert('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Convert form data to HTML content
  const generateHTMLContent = (data) => {
    switch (type) {
      case 'faq':
        return `<h3>${data.question || 'Question'}</h3>\n<p>${data.answer || 'Answer goes here...'}</p>`;
      
      case 'documentation':
        let docHTML = `<h2>${data.title || 'Guide'}</h2>\n`;
        if (data.introduction) {
          docHTML += `<p>${data.introduction}</p>\n`;
        }
        if (data.steps && data.steps.length > 0) {
          docHTML += `<ol>\n`;
          data.steps.forEach(step => {
            if (step.title && step.description) {
              docHTML += `  <li><strong>${step.title}</strong>: ${step.description}</li>\n`;
            }
          });
          docHTML += `</ol>\n`;
        }
        return docHTML;
      
      case 'policy':
        let policyHTML = `<h2>${data.title || 'Policy'}</h2>\n`;
        policyHTML += `<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>\n`;
        if (data.sections && data.sections.length > 0) {
          data.sections.forEach(section => {
            if (section.title && section.content) {
              policyHTML += `<h3>${section.title}</h3>\n`;
              policyHTML += `<p>${section.content}</p>\n`;
            }
          });
        }
        return policyHTML;
      
      case 'announcement':
        return `<h2>📢 ${data.title || 'Announcement'}</h2>\n<p>${data.announcement || 'Your announcement here...'}</p>`;
      
      case 'help':
        let helpHTML = `<h2>How to ${data.title || '...'}</h2>\n`;
        if (data.problem) {
          helpHTML += `<h3>Problem</h3>\n<p>${data.problem}</p>\n`;
        }
        if (data.solution) {
          helpHTML += `<h3>Solution</h3>\n<p>${data.solution}</p>\n`;
        }
        if (data.steps && data.steps.length > 0) {
          helpHTML += `<ol>\n`;
          data.steps.forEach(step => {
            if (step.title && step.description) {
              helpHTML += `  <li><strong>${step.title}</strong>: ${step.description}</li>\n`;
            }
          });
          helpHTML += `</ol>\n`;
        }
        return helpHTML;
      
      default:
        return data.content || '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Generate HTML content from form data
      const htmlContent = generateHTMLContent(formData);
      
      const data = {
        type: type,
        title: formData.title,
        content: htmlContent,
        category: formData.category || 'General',
        isPublished: formData.isPublished,
      };
      
      if (editingItem) {
        await API.put(`/api/admin/content/${editingItem._id}`, data);
      } else {
        await API.post('/api/admin/content', data);
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchItems();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await API.delete(`/api/admin/content/${id}`);
      fetchItems();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    // Parse content and populate form fields
    const parsedData = parseContentToForm(item.content);
    setFormData({
      title: item.title,
      category: item.category || '',
      isPublished: item.isPublished,
      ...parsedData,
    });
    setShowModal(true);
  };

  // Parse HTML content back to form data
  const parseContentToForm = (html) => {
    const data = {};
    
    switch (type) {
      case 'faq': {
        const questionMatch = html.match(/<h3>(.*?)<\/h3>/);
        const answerMatch = html.match(/<p>(.*?)<\/p>/);
        data.question = questionMatch ? questionMatch[1] : '';
        data.answer = answerMatch ? answerMatch[1] : '';
        break;
      }
      case 'documentation': {
        const introMatch = html.match(/<p>(.*?)<\/p>/);
        data.introduction = introMatch ? introMatch[1] : '';
        
        const stepMatches = html.match(/<li><strong>(.*?)<\/strong>:\s*(.*?)<\/li>/g);
        if (stepMatches) {
          data.steps = stepMatches.map(match => {
            const [, title, description] = match.match(/<li><strong>(.*?)<\/strong>:\s*(.*?)<\/li>/) || [];
            return { title: title || '', description: description || '' };
          });
        } else {
          data.steps = [{ title: '', description: '' }];
        }
        break;
      }
      case 'policy': {
        const sectionMatches = html.match(/<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/gs);
        if (sectionMatches) {
          data.sections = sectionMatches.map(match => {
            const [, title, content] = match.match(/<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/) || [];
            return { title: title || '', content: content || '' };
          });
        } else {
          data.sections = [{ title: '', content: '' }];
        }
        break;
      }
      case 'announcement': {
        const announceMatch = html.match(/<p>(.*?)<\/p>/);
        data.announcement = announceMatch ? announceMatch[1] : '';
        break;
      }
      case 'help': {
        const problemMatch = html.match(/<h3>Problem<\/h3>\s*<p>(.*?)<\/p>/);
        const solutionMatch = html.match(/<h3>Solution<\/h3>\s*<p>(.*?)<\/p>/);
        data.problem = problemMatch ? problemMatch[1] : '';
        data.solution = solutionMatch ? solutionMatch[1] : '';
        
        const stepMatches = html.match(/<li><strong>(.*?)<\/strong>:\s*(.*?)<\/li>/g);
        if (stepMatches) {
          data.steps = stepMatches.map(match => {
            const [, title, description] = match.match(/<li><strong>(.*?)<\/strong>:\s*(.*?)<\/li>/) || [];
            return { title: title || '', description: description || '' };
          });
        } else {
          data.steps = [{ title: '', description: '' }];
        }
        break;
      }
    }
    
    return data;
  };

  const resetForm = () => {
    const template = typeInfo.template || {};
    setFormData({
      title: '',
      category: '',
      isPublished: true,
      ...template,
    });
  };

  // Render form fields based on content type
  const renderFormFields = () => {
    switch (type) {
      case 'faq':
        return (
          <>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Question *</label>
              <input
                type="text"
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter the question"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Answer *</label>
              <textarea
                value={formData.answer || ''}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows="4"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter the answer"
                required
              />
            </div>
          </>
        );

      case 'documentation':
        return (
          <>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Introduction</label>
              <textarea
                value={formData.introduction || ''}
                onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                rows="3"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Introduction to the guide..."
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Steps</label>
              {formData.steps && formData.steps.map((step, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Step {index + 1}</span>
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = formData.steps.filter((_, i) => i !== index);
                          setFormData({ ...formData, steps: newSteps });
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={step.title || ''}
                    onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[index].title = e.target.value;
                      setFormData({ ...formData, steps: newSteps });
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                    placeholder={`Step ${index + 1} title`}
                  />
                  <textarea
                    value={step.description || ''}
                    onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[index].description = e.target.value;
                      setFormData({ ...formData, steps: newSteps });
                    }}
                    rows="2"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Step ${index + 1} description`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    steps: [...(formData.steps || []), { title: '', description: '' }]
                  });
                }}
                className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
              >
                + Add Step
              </button>
            </div>
          </>
        );

      case 'policy':
        return (
          <>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Sections</label>
              {formData.sections && formData.sections.map((section, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Section {index + 1}</span>
                    {formData.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSections = formData.sections.filter((_, i) => i !== index);
                          setFormData({ ...formData, sections: newSections });
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={section.title || ''}
                    onChange={(e) => {
                      const newSections = [...formData.sections];
                      newSections[index].title = e.target.value;
                      setFormData({ ...formData, sections: newSections });
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                    placeholder={`Section ${index + 1} title`}
                  />
                  <textarea
                    value={section.content || ''}
                    onChange={(e) => {
                      const newSections = [...formData.sections];
                      newSections[index].content = e.target.value;
                      setFormData({ ...formData, sections: newSections });
                    }}
                    rows="3"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Section ${index + 1} content`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    sections: [...(formData.sections || []), { title: '', content: '' }]
                  });
                }}
                className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
              >
                + Add Section
              </button>
            </div>
          </>
        );

      case 'announcement':
        return (
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Announcement Message *</label>
            <textarea
              value={formData.announcement || ''}
              onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
              rows="5"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Write your announcement here..."
              required
            />
          </div>
        );

      case 'help':
        return (
          <>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Problem Description *</label>
              <textarea
                value={formData.problem || ''}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                rows="3"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe the problem..."
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Solution *</label>
              <textarea
                value={formData.solution || ''}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                rows="3"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe the solution..."
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Steps</label>
              {formData.steps && formData.steps.map((step, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Step {index + 1}</span>
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = formData.steps.filter((_, i) => i !== index);
                          setFormData({ ...formData, steps: newSteps });
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={step.title || ''}
                    onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[index].title = e.target.value;
                      setFormData({ ...formData, steps: newSteps });
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                    placeholder={`Step ${index + 1} title`}
                  />
                  <textarea
                    value={step.description || ''}
                    onChange={(e) => {
                      const newSteps = [...formData.steps];
                      newSteps[index].description = e.target.value;
                      setFormData({ ...formData, steps: newSteps });
                    }}
                    rows="2"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Step ${index + 1} description`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    steps: [...(formData.steps || []), { title: '', description: '' }]
                  });
                }}
                className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
              >
                + Add Step
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/content"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </Link>
            <div>
              <h1 className={`text-2xl font-bold text-white flex items-center gap-2`}>
                <span className="text-3xl">{typeInfo.icon}</span>
                {typeInfo.label}
              </h1>
              <p className="text-gray-400 text-sm">{items.length} items</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingItem(null);
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span className="text-xl">+</span> Add New
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                resetForm();
                setEditingItem(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center gap-2"
            >
              <span className="text-lg">⚡</span> Quick Create
            </button>
            <button
              onClick={fetchItems}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchItems()}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={fetchItems}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              🔍 Search
            </button>
          </div>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-white mb-2">No {typeInfo.label} Yet</h3>
            <p className="text-gray-400 text-sm mb-4">Create your first {typeInfo.label.toLowerCase()} item.</p>
            <button
              onClick={() => {
                resetForm();
                setEditingItem(null);
                setShowModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-colors inline-flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add First Item
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden lg:table-cell">Updated</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{item.title}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{item.category || '—'}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          item.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {item.isPublished ? '✅ Live' : '📝 Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm hidden lg:table-cell">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal - Form Based */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? `Edit ${typeInfo.label.slice(0, -1)}` : `Add New ${typeInfo.label.slice(0, -1)}`}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common Fields */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter a clear, descriptive title"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., General, Technical, Support"
                />
              </div>

              {/* Type-specific fields */}
              {renderFormFields()}

              {/* Publish */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                />
                <label className="text-gray-300 text-sm">Publish immediately</label>
              </div>

              {/* Preview of generated HTML */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">📄 Preview (auto-generated)</p>
                <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 max-h-40 overflow-y-auto">
                  {generateHTMLContent(formData) || 'Content preview will appear here...'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ContentList;