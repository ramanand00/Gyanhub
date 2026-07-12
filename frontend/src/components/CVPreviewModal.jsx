// components/CVPreviewModal.jsx
import React, { useRef, useState } from 'react';
import { FiX, FiDownload, FiLayout } from 'react-icons/fi';
import { FaSpinner, FaCheck } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CVTemplate, { Template1, Template2, Template2Page2 } from './CVTemplate';

const CVPreviewModal = ({ 
  isOpen, 
  onClose, 
  profileData, 
  user, 
  formatDate, 
  getInitials,
  platformName = "GyanPark",
  logo
}) => {
  const template1Ref = useRef(null);
  const template2Ref = useRef(null);
  const template2Page2Ref = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("template1");

  if (!isOpen) return null;

  const downloadCV = async () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      if (selectedTemplate === "template1") {
        // Template 1 - Single page
        const canvas = await html2canvas(template1Ref.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          crossOrigin: "anonymous"
        });
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        // Template 2 - Two pages
        const canvas1 = await html2canvas(template2Ref.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          crossOrigin: "anonymous"
        });
        const imgData1 = canvas1.toDataURL('image/png');
        pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, pdfHeight);

        pdf.addPage();

        const canvas2 = await html2canvas(template2Page2Ref.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          crossOrigin: "anonymous"
        });
        const imgData2 = canvas2.toDataURL('image/png');
        pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${profileData.name || 'User'}_CV.pdf`);
      onClose();
    } catch (error) {
      console.error('Error generating CV:', error);
      alert('Failed to generate CV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiLayout className="text-green-600" />
              CV Preview
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadCV}
                disabled={downloading}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FiDownload className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Template Selector */}
          <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3">
            <span className="text-sm font-medium text-gray-600">Choose Template:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTemplate("template1")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedTemplate === "template1"
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                {selectedTemplate === "template1" && <FaCheck className="w-3 h-3" />}
                Professional Sidebar
              </button>
              <button
                onClick={() => setSelectedTemplate("template2")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedTemplate === "template2"
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                {selectedTemplate === "template2" && <FaCheck className="w-3 h-3" />}
                Centered Header
              </button>
            </div>
          </div>
        </div>

        {/* CV Content */}
        <div className="p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {selectedTemplate === "template1" ? (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div ref={template1Ref}>
                  <Template1 
                    profileData={profileData}
                    user={user}
                    formatDate={formatDate}
                    getInitials={getInitials}
                    platformName={platformName}
                    logo={logo}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                  <div ref={template2Ref}>
                    <Template2 
                      profileData={profileData}
                      user={user}
                      formatDate={formatDate}
                      getInitials={getInitials}
                      platformName={platformName}
                      logo={logo}
                    />
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div ref={template2Page2Ref}>
                    <Template2Page2 
                      profileData={profileData}
                      user={user}
                      formatDate={formatDate}
                      getInitials={getInitials}
                      platformName={platformName}
                      logo={logo}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVPreviewModal;