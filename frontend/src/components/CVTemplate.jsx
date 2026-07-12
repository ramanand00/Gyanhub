// components/CVTemplate.jsx
import React from 'react';
import { 
  FaLinkedin, FaGithub, FaTwitter, FaInstagram, 
  FaFacebook, FaYoutube, FaGlobe, FaEnvelope, 
  FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaUser,
  FaGraduationCap, FaCode, FaHeart, FaLink,
  FaStar, FaAward, FaBriefcase, FaBook
} from 'react-icons/fa';
import { FiMail, FiPhone as FiPhoneIcon, FiMapPin } from 'react-icons/fi';

// ============================================
// TEMPLATE 1: Professional Sidebar Layout
// ============================================
export const Template1 = ({ profileData, user, formatDate, getInitials, platformName = "GyanPark", logo }) => {
  const pageStyle = {
    width: '210mm',
    height: '297mm',
    padding: '40px',
    background: 'white',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    position: 'relative',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const watermarkStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-30deg)',
    fontSize: '100px',
    fontWeight: 'bold',
    color: 'rgba(34, 197, 94, 0.04)',
    pointerEvents: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    letterSpacing: '20px',
    zIndex: 0,
    fontFamily: 'Arial, sans-serif'
  };

  return (
    <div style={pageStyle}>
      {/* Watermark */}
      <div style={watermarkStyle}>
        {platformName}
      </div>

      {/* Main Content - Two Column Layout */}
      <div style={{ 
        display: 'flex', 
        gap: '30px', 
        flex: 1,
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left Column - Sidebar */}
        <div style={{ 
          width: '30%', 
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Profile Image */}
          <div style={{
            textAlign: 'center',
            marginBottom: '10px'
          }}>
            <div style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 auto 15px auto',
              overflow: 'hidden'
            }}>
              {profileData.profilePicture && !profileData.profilePicture.includes('googleusercontent.com') ? (
                <img 
                  src={profileData.profilePicture} 
                  alt={profileData.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  crossOrigin="anonymous"
                />
              ) : (
                getInitials(profileData.name || 'User')
              )}
            </div>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              margin: '0 0 5px 0', 
              color: '#1a1a1a'
            }}>
              {profileData.name || user?.name || 'User'}
            </h2>
            {profileData.bio && (
              <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>
                {profileData.bio}
              </p>
            )}
          </div>

          {/* About Me / Bio */}
          {profileData.bio && (
            <div style={{
              padding: '15px',
              background: '#f8fafc',
              borderRadius: '8px'
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#22c55e',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                About Me
              </h3>
              <p style={{ 
                fontSize: '12px', 
                color: '#555', 
                lineHeight: '1.6',
                margin: 0
              }}>
                {profileData.bio}
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: '#22c55e',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Contact
            </h3>
            <div style={{ fontSize: '12px', color: '#555' }}>
              {user?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <FiMail style={{ color: '#22c55e', fontSize: '14px' }} />
                  <span>{user.email}</span>
                </div>
              )}
              {profileData.mobileNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <FiPhoneIcon style={{ color: '#22c55e', fontSize: '14px' }} />
                  <span>{profileData.mobileNumber}</span>
                </div>
              )}
              {profileData.address && (profileData.address.city || profileData.address.country) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiMapPin style={{ color: '#22c55e', fontSize: '14px' }} />
                  <span>
                    {profileData.address.city && `${profileData.address.city}, `}
                    {profileData.address.country}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {profileData.skills && profileData.skills.length > 0 && (
            <div>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#22c55e',
                margin: '0 0 10px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profileData.skills.map((skill, index) => (
                  <span key={index} style={{
                    background: '#f0fdf4',
                    color: '#22c55e',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500',
                    border: '1px solid #bbf7d0'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {profileData.interests && profileData.interests.length > 0 && (
            <div>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#22c55e',
                margin: '0 0 10px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Interests
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profileData.interests.map((interest, index) => (
                  <span key={index} style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    border: '1px solid #fde68a'
                  }}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Main Content */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Education */}
          {profileData.education && profileData.education.length > 0 && (
            <div>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#22c55e',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid #22c55e',
                paddingBottom: '6px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FaGraduationCap style={{ marginRight: '8px', fontSize: '14px' }} />
                Education
              </h3>
              {profileData.education.map((edu, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    margin: '0 0 2px 0',
                    color: '#1a1a1a'
                  }}>
                    {edu.degree} {edu.field && `- ${edu.field}`}
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#555', 
                    margin: '0 0 2px 0',
                    fontWeight: '500'
                  }}>
                    {edu.institution}
                  </p>
                  {edu.startYear && (
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#888', 
                      margin: '0 0 4px 0'
                    }}>
                      {edu.startYear} {edu.endYear ? `- ${edu.endYear}` : edu.current ? '- Present' : ''}
                    </p>
                  )}
                  {edu.description && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Social Links */}
          {Object.values(profileData.socialLinks || {}).some(v => v) && (
            <div>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#22c55e',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid #22c55e',
                paddingBottom: '6px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FaLink style={{ marginRight: '8px', fontSize: '14px' }} />
                Social Links
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profileData.socialLinks?.linkedin && (
                  <a 
                    href={profileData.socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#0A66C2',
                      fontSize: '12px',
                      textDecoration: 'none',
                      padding: '4px 10px',
                      background: '#f0f7ff',
                      borderRadius: '4px'
                    }}
                  >
                    <FaLinkedin /> LinkedIn
                  </a>
                )}
                {profileData.socialLinks?.github && (
                  <a 
                    href={profileData.socialLinks.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#333',
                      fontSize: '12px',
                      textDecoration: 'none',
                      padding: '4px 10px',
                      background: '#f3f4f6',
                      borderRadius: '4px'
                    }}
                  >
                    <FaGithub /> GitHub
                  </a>
                )}
                {profileData.socialLinks?.twitter && (
                  <a 
                    href={profileData.socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#1DA1F2',
                      fontSize: '12px',
                      textDecoration: 'none',
                      padding: '4px 10px',
                      background: '#f0f9ff',
                      borderRadius: '4px'
                    }}
                  >
                    <FaTwitter /> Twitter
                  </a>
                )}
                {profileData.socialLinks?.instagram && (
                  <a 
                    href={profileData.socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#E4405F',
                      fontSize: '12px',
                      textDecoration: 'none',
                      padding: '4px 10px',
                      background: '#fdf0f2',
                      borderRadius: '4px'
                    }}
                  >
                    <FaInstagram /> Instagram
                  </a>
                )}
                {profileData.socialLinks?.website && (
                  <a 
                    href={profileData.socialLinks.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#22c55e',
                      fontSize: '12px',
                      textDecoration: 'none',
                      padding: '4px 10px',
                      background: '#f0fdf4',
                      borderRadius: '4px'
                    }}
                  >
                    <FaGlobe /> Website
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Footer info */}
          <div style={{ 
            marginTop: 'auto',
            paddingTop: '15px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center',
            fontSize: '10px',
            color: '#999'
          }}>
            <span>Template 1 • CV Generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} • {profileData.name || 'User'} • {platformName}</span>
          </div>
        </div>
      </div>

      {/* Footer with Logo */}
      <div style={{ 
        marginTop: '10px',
        paddingTop: '10px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
        zIndex: 1
      }}>
        {logo && (
          <img 
            src={logo} 
            alt={platformName}
            style={{ width: '20px', height: '20px', opacity: 0.6 }}
          />
        )}
        <span style={{ fontSize: '10px', color: '#999' }}>
          Powered by {platformName}
        </span>
      </div>
    </div>
  );
};

// ============================================
// TEMPLATE 2: Centered Header Layout
// ============================================
export const Template2 = ({ profileData, user, formatDate, getInitials, platformName = "GyanPark", logo }) => {
  const pageStyle = {
    width: '210mm',
    height: '297mm',
    padding: '40px',
    background: 'white',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    position: 'relative',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const watermarkStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-30deg)',
    fontSize: '100px',
    fontWeight: 'bold',
    color: 'rgba(34, 197, 94, 0.06)',
    pointerEvents: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    letterSpacing: '20px',
    zIndex: 0,
    fontFamily: 'Arial, sans-serif'
  };

  // Helper to get social media icon
  const getSocialIcon = (platform) => {
    switch(platform) {
      case 'linkedin': return <FaLinkedin style={{ color: '#0A66C2' }} />;
      case 'github': return <FaGithub style={{ color: '#333' }} />;
      case 'twitter': return <FaTwitter style={{ color: '#1DA1F2' }} />;
      case 'instagram': return <FaInstagram style={{ color: '#E4405F' }} />;
      case 'facebook': return <FaFacebook style={{ color: '#1877F2' }} />;
      case 'youtube': return <FaYoutube style={{ color: '#FF0000' }} />;
      case 'website': return <FaGlobe style={{ color: '#22c55e' }} />;
      default: return <FaLink style={{ color: '#666' }} />;
    }
  };

  return (
    <div style={pageStyle}>
      {/* Watermark - Platform Name only */}
      <div style={watermarkStyle}>
        {platformName}
      </div>

      {/* Header with Logo */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ flex: 1 }}></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: 0.7
        }}>
          {logo && (
            <img 
              src={logo} 
              alt={platformName}
              style={{ width: '30px', height: '30px' }}
            />
          )}
          <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 'bold' }}>
            {platformName}
          </span>
        </div>
      </div>

      {/* Profile Section */}
      <div style={{ 
        textAlign: 'center',
        borderBottom: '3px solid #22c55e',
        paddingBottom: '25px',
        marginBottom: '25px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: '#22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          fontWeight: 'bold',
          color: 'white',
          margin: '0 auto 15px auto',
          overflow: 'hidden'
        }}>
          {profileData.profilePicture && !profileData.profilePicture.includes('googleusercontent.com') ? (
            <img 
              src={profileData.profilePicture} 
              alt={profileData.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              crossOrigin="anonymous"
            />
          ) : (
            getInitials(profileData.name || 'User')
          )}
        </div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          margin: '0 0 5px 0', 
          color: '#1a1a1a'
        }}>
          {profileData.name || user?.name || 'User'}
        </h1>
        {profileData.bio && (
          <p style={{ fontSize: '16px', color: '#666', margin: '5px 0 0 0' }}>
            {profileData.bio}
          </p>
        )}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '25px', 
          marginTop: '10px', 
          fontSize: '14px', 
          color: '#555',
          flexWrap: 'wrap'
        }}>
          {user?.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiMail style={{ color: '#22c55e' }} />
              {user.email}
            </span>
          )}
          {profileData.mobileNumber && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiPhoneIcon style={{ color: '#22c55e' }} />
              {profileData.mobileNumber}
            </span>
          )}
        </div>
      </div>

      {/* Personal Details */}
      <div style={{ marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: '#22c55e',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '8px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaUser style={{ fontSize: '16px' }} />
          Personal Details
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaUser style={{ color: '#22c55e', fontSize: '14px' }} />
            <strong>Full Name:</strong> {profileData.name || 'N/A'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiMail style={{ color: '#22c55e', fontSize: '14px' }} />
            <strong>Email:</strong> {user?.email || 'N/A'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiPhoneIcon style={{ color: '#22c55e', fontSize: '14px' }} />
            <strong>Mobile:</strong> {profileData.mobileNumber || 'N/A'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaCalendarAlt style={{ color: '#22c55e', fontSize: '14px' }} />
            <strong>Member Since:</strong> {formatDate(user?.createdAt)}
          </div>
          {profileData.address && (profileData.address.street || profileData.address.city) && (
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiMapPin style={{ color: '#22c55e', fontSize: '14px' }} />
              <strong>Address:</strong> {profileData.address.street && `${profileData.address.street}, `}
              {profileData.address.city && `${profileData.address.city}, `}
              {profileData.address.state && `${profileData.address.state}, `}
              {profileData.address.country}
              {profileData.address.pincode && ` - ${profileData.address.pincode}`}
            </div>
          )}
        </div>
      </div>

      {/* Education */}
      {profileData.education && profileData.education.length > 0 && (
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#22c55e',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '8px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaGraduationCap style={{ fontSize: '16px' }} />
            Education
          </h2>
          {profileData.education.map((edu, index) => (
            <div key={index} style={{ 
              marginBottom: '12px', 
              paddingLeft: '12px', 
              borderLeft: '3px solid #22c55e'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                {edu.institution}
              </h3>
              <div style={{ fontSize: '13px', color: '#555' }}>
                {edu.degree} {edu.field && `- ${edu.field}`}
              </div>
              {edu.startYear && (
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {edu.startYear} {edu.endYear ? `- ${edu.endYear}` : edu.current ? '- Present' : ''}
                </div>
              )}
              {edu.description && (
                <div style={{ fontSize: '13px', color: '#666', marginTop: '3px' }}>
                  {edu.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '2px solid #e5e7eb',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          color: '#888'
        }}>
          <span>Template 2</span>
          <span>•</span>
          <span>CV Generated on {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaStar style={{ color: '#22c55e', fontSize: '10px' }} />
            {platformName}
          </span>
        </div>
      </div>
    </div>
  );
};

// Template 2 Page 2
export const Template2Page2 = ({ profileData, user, formatDate, getInitials, platformName = "GyanPark", logo }) => {
  const pageStyle = {
    width: '210mm',
    height: '297mm',
    padding: '40px',
    background: 'white',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    position: 'relative',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const watermarkStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-30deg)',
    fontSize: '100px',
    fontWeight: 'bold',
    color: 'rgba(34, 197, 94, 0.06)',
    pointerEvents: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    letterSpacing: '20px',
    zIndex: 0,
    fontFamily: 'Arial, sans-serif'
  };

  const getSocialIcon = (platform) => {
    switch(platform) {
      case 'linkedin': return <FaLinkedin style={{ color: '#0A66C2' }} />;
      case 'github': return <FaGithub style={{ color: '#333' }} />;
      case 'twitter': return <FaTwitter style={{ color: '#1DA1F2' }} />;
      case 'instagram': return <FaInstagram style={{ color: '#E4405F' }} />;
      case 'facebook': return <FaFacebook style={{ color: '#1877F2' }} />;
      case 'youtube': return <FaYoutube style={{ color: '#FF0000' }} />;
      case 'website': return <FaGlobe style={{ color: '#22c55e' }} />;
      default: return <FaLink style={{ color: '#666' }} />;
    }
  };

  return (
    <div style={pageStyle}>
      <div style={watermarkStyle}>
        {platformName}
      </div>

      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ flex: 1 }}></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: 0.7
        }}>
          {logo && (
            <img 
              src={logo} 
              alt={platformName}
              style={{ width: '30px', height: '30px' }}
            />
          )}
          <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 'bold' }}>
            {platformName}
          </span>
        </div>
      </div>

      {/* Skills */}
      {profileData.skills && profileData.skills.length > 0 && (
        <div style={{ marginBottom: '25px', position: 'relative', zIndex: 1 }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#22c55e',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '8px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaCode style={{ fontSize: '16px' }} />
            Skills
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {profileData.skills.map((skill, index) => (
              <span key={index} style={{
                background: '#f3f4f6',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <FaCode style={{ fontSize: '11px', color: '#22c55e' }} />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {profileData.interests && profileData.interests.length > 0 && (
        <div style={{ marginBottom: '25px', position: 'relative', zIndex: 1 }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#22c55e',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '8px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaHeart style={{ fontSize: '16px' }} />
            Interests
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {profileData.interests.map((interest, index) => (
              <span key={index} style={{
                background: '#fef3c7',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #fde68a'
              }}>
                <FaHeart style={{ fontSize: '11px', color: '#f59e0b' }} />
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {Object.values(profileData.socialLinks || {}).some(v => v) && (
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#22c55e',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '8px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaLink style={{ fontSize: '16px' }} />
            Social Links
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {profileData.socialLinks?.linkedin && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#f8f9fa',
                border: '1px solid #e5e7eb'
              }}>
                {getSocialIcon('linkedin')}
                <a 
                  href={profileData.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#0A66C2', 
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    fontSize: '12px'
                  }}
                >
                  {profileData.socialLinks.linkedin.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </a>
              </div>
            )}
            {profileData.socialLinks?.github && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#f8f9fa',
                border: '1px solid #e5e7eb'
              }}>
                {getSocialIcon('github')}
                <a 
                  href={profileData.socialLinks.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#333', 
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    fontSize: '12px'
                  }}
                >
                  {profileData.socialLinks.github.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </a>
              </div>
            )}
            {profileData.socialLinks?.twitter && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#f8f9fa',
                border: '1px solid #e5e7eb'
              }}>
                {getSocialIcon('twitter')}
                <a 
                  href={profileData.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#1DA1F2', 
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    fontSize: '12px'
                  }}
                >
                  {profileData.socialLinks.twitter.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </a>
              </div>
            )}
            {profileData.socialLinks?.instagram && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#f8f9fa',
                border: '1px solid #e5e7eb'
              }}>
                {getSocialIcon('instagram')}
                <a 
                  href={profileData.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#E4405F', 
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    fontSize: '12px'
                  }}
                >
                  {profileData.socialLinks.instagram.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </a>
              </div>
            )}
            {profileData.socialLinks?.facebook && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#f8f9fa',
                border: '1px solid #e5e7eb'
              }}>
                {getSocialIcon('facebook')}
                <a 
                  href={profileData.socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#1877F2', 
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    fontSize: '12px'
                  }}
                >
                  {profileData.socialLinks.facebook.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </a>
              </div>
            )}
            {profileData.socialLinks?.youtube && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#f8f9fa',
                border: '1px solid #e5e7eb'
              }}>
                {getSocialIcon('youtube')}
                <a 
                  href={profileData.socialLinks.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#FF0000', 
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    fontSize: '12px'
                  }}
                >
                  {profileData.socialLinks.youtube.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </a>
              </div>
            )}
            {profileData.socialLinks?.website && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#f8f9fa',
                border: '1px solid #e5e7eb'
              }}>
                {getSocialIcon('website')}
                <a 
                  href={profileData.socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#22c55e', 
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    fontSize: '12px'
                  }}
                >
                  {profileData.socialLinks.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '2px solid #e5e7eb',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          color: '#888'
        }}>
          <span>Template 2 • Page 2 of 2</span>
          <span>•</span>
          <span>CV Generated on {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaStar style={{ color: '#22c55e', fontSize: '10px' }} />
            {platformName}
          </span>
        </div>
        <div style={{ 
          marginTop: '5px',
          fontSize: '10px',
          color: '#ccc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px'
        }}>
          {logo && (
            <img 
              src={logo} 
              alt={platformName}
              style={{ width: '16px', height: '16px', opacity: 0.5 }}
            />
          )}
          <span>Powered by {platformName}</span>
        </div>
      </div>
    </div>
  );
};

// Main CV Template selector
const CVTemplate = ({ profileData, user, formatDate, getInitials, platformName = "GyanPark", logo, template = "template1" }) => {
  if (template === "template2") {
    return (
      <div>
        <Template2 
          profileData={profileData}
          user={user}
          formatDate={formatDate}
          getInitials={getInitials}
          platformName={platformName}
          logo={logo}
        />
        <Template2Page2 
          profileData={profileData}
          user={user}
          formatDate={formatDate}
          getInitials={getInitials}
          platformName={platformName}
          logo={logo}
        />
      </div>
    );
  }

  // Default: Template 1 (only 1 page)
  return (
    <Template1 
      profileData={profileData}
      user={user}
      formatDate={formatDate}
      getInitials={getInitials}
      platformName={platformName}
      logo={logo}
    />
  );
};

export default CVTemplate;