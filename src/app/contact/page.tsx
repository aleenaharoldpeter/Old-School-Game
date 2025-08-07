"use client";

import { useState } from "react";
import { toast } from "sonner";

interface FormData {
  name: string;
  email: string;
  reason: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  reason?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    reason: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      
      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return "Please enter a valid email address";
        return "";
      
      case "reason":
        if (!value.trim()) return "Reason is required";
        if (value.trim().length < 3) return "Reason must be at least 3 characters";
        return "";
      
      case "message":
        if (!value.trim()) return "Message is required";
        if (value.trim().length < 10) return "Message must be at least 10 characters";
        if (value.trim().length > 1000) return "Message must be less than 1000 characters";
        return "";
      
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      reason: true,
      message: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Thank you for reaching out! We'll get back to you soon.", {
        duration: 5000,
        description: "Your message has been sent successfully."
      });
      
      setFormData({ name: "", email: "", reason: "", message: "" });
      setErrors({});
      setTouched({});
      
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        
        
        .contact-wrapper {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .contact-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .contact-title {
          font-size: 2.5rem;
          font-weight: 700;
          color:black;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .contact-subtitle {
          font-size: 1.1rem;
          color: black;
          line-height: 1.6;
        }
        
        .contact-form {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          backdrop-filter: blur(10px);
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .required {
          color: #ef4444;
        }
        
        .form-input, .form-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fafafa;
          box-sizing: border-box;
        }
        
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: black;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-input.error, .form-textarea.error {
          border-color: #ef4444;
          background: #fef2f2;
        }
        
        .form-input.success, .form-textarea.success {
          border-color: #10b981;
          background: #f0fdf4;
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 120px;
          font-family: inherit;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .character-count {
          text-align: right;
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        
        .character-count.warning {
          color: #ef4444;
        }
        
        .submit-button {
          width: 100%;
          background: black;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .submit-button:hover:not(:disabled) {
          transform: translateY(-1px);
         
        }
        
        .submit-button:active {
          transform: translateY(0);
        }
        
        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 0.5rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .contact-footer {
          text-align: center;
          margin-top: 2rem;
          color: rgba(255,255,255,0.8);
        }
        
        .contact-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
        }
        
        .contact-link:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 640px) {
          .contact-container {
            padding: 1rem 0.5rem;
          }
          
          .contact-title {
            font-size: 2rem;
          }
          
          .contact-form {
            padding: 1.5rem;
          }
        }
      `}</style>
      
      {/* <div className="contact-container"> */}
        <div className="contact-wrapper">
          <div className="contact-header">
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">
              We would love to hear from you. Send us a message and we will respond as soon as possible.
            </p>
          </div>

          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${
                    touched.name && errors.name ? 'error' : 
                    touched.name && !errors.name && formData.name ? 'success' : ''
                  }`}
                  placeholder="Enter your full name"
                />
                {touched.name && errors.name && (
                  <div className="error-message">
                    ⚠ {errors.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${
                    touched.email && errors.email ? 'error' : 
                    touched.email && !errors.email && formData.email ? 'success' : ''
                  }`}
                  placeholder="Enter your email address"
                />
                {touched.email && errors.email && (
                  <div className="error-message">
                    ⚠ {errors.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reason" className="form-label">
                  Reason <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-input ${
                    touched.reason && errors.reason ? 'error' : 
                    touched.reason && !errors.reason && formData.reason ? 'success' : ''
                  }`}
                  placeholder="What's this about?"
                />
                {touched.reason && errors.reason && (
                  <div className="error-message">
                    ⚠ {errors.reason}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-textarea ${
                    touched.message && errors.message ? 'error' : 
                    touched.message && !errors.message && formData.message ? 'success' : ''
                  }`}
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                />
                {touched.message && errors.message && (
                  <div className="error-message">
                    ⚠ {errors.message}
                  </div>
                )}
                <div className={`character-count ${formData.message.length > 900 ? 'warning' : ''}`}>
                  {formData.message.length}/1000
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading && <span className="loading-spinner"></span>}
                {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="contact-footer">
            <p>
              Need immediate assistance? Reach out to us directly at{' '}
              <a href="mailto:contact@example.com" className="contact-link">
                contact@example.com
              </a>
            </p>
          </div>
        </div>
      {/* </div> */}
    </>
  );
}
