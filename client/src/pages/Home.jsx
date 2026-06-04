import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Navbar component for public pages - with inline styles for visibility
export const Navbar = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;

  return (
    <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem' }}>🦷</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>Dental Clinic</span>
          </Link>
          <div style={{ display: isMobile ? 'none' : 'flex', gap: '1rem' }}>
            <Link to="/login" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '500', color: 'white', backgroundColor: '#2563eb', borderRadius: '0.375rem', textDecoration: 'none' }}>Register</Link>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#374151' }}
            >
              {isMobileOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
        {isMobile && isMobileOpen && (
          <div style={{ marginTop: '1rem' }}>
            <Link to="/login" style={{ display: 'block', padding: '0.5rem 1rem', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ display: 'block', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '500', color: 'white', backgroundColor: '#2563eb', borderRadius: '0.375rem', textDecoration: 'none' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// Premium Landing Page
const Home = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '42rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#111827', marginBottom: '1rem', lineHeight: '1.2' }}>
            Modern Dental Practice Management
          </h1>
          <p style={{ color: '#4b5563', marginBottom: '2rem', fontSize: '1.25rem', lineHeight: '1.6' }}>
            Streamline your dental clinic operations with our comprehensive management system. 
            Manage patients, appointments, and clinical records with ease and security.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/login" 
              style={{ 
                padding: '0.75rem 2rem', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                borderRadius: '0.5rem', 
                fontWeight: '600', 
                textDecoration: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
              }}
            >
              Sign In to Your Practice
            </Link>
            <Link 
              to="/register" 
              style={{ 
                padding: '0.75rem 2rem', 
                backgroundColor: 'white', 
                color: '#374151', 
                borderRadius: '0.5rem', 
                fontWeight: '500', 
                border: '1px solid #d1d5db',
                textDecoration: 'none',
                fontSize: '1rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              Create New Practice
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 1rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '3rem' }}>
            Powerful Features for Your Practice
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', padding: '0 1rem' }}>
            <div style={{ backgroundColor: '#f9fafb', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '3rem', height: '3rem', backgroundColor: '#2563eb', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ color: 'white', fontSize: '1.5rem' }}>👥</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Patient Management</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                Keep comprehensive patient records, treatment history, and contact information organized in one secure place.
              </p>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '3rem', height: '3rem', backgroundColor: '#059669', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ color: 'white', fontSize: '1.5rem' }}>📅</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Appointment Scheduling</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                Effortlessly schedule, reschedule, and manage appointments with our intuitive calendar system.
              </p>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '3rem', height: '3rem', backgroundColor: '#7c3aed', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ color: 'white', fontSize: '1.5rem' }}>📋</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Clinical Records</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                Maintain detailed clinical notes, treatment plans, and dental charts for comprehensive care.
              </p>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '3rem', height: '3rem', backgroundColor: '#dc2626', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ color: 'white', fontSize: '1.5rem' }}>💳</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Billing & Payments</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                Generate invoices, track payments, and manage insurance claims with integrated billing tools.
              </p>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '3rem', height: '3rem', backgroundColor: '#ea580c', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ color: 'white', fontSize: '1.5rem' }}>📊</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Analytics & Reports</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                Gain insights into your practice performance with detailed analytics and customizable reports.
              </p>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '3rem', height: '3rem', backgroundColor: '#0891b2', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ color: 'white', fontSize: '1.5rem' }}>🔒</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>Secure & Compliant</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                HIPAA-compliant data protection with bank-level encryption for your patients' information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', color: '#9ca3af', padding: '2rem 1rem', marginTop: 'auto' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', textAlign: 'center', fontSize: '0.875rem' }}>
          <p>&copy; 2024 Dental Clinic Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;