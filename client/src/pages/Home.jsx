import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ── Shared branded navbar used by Login & Register pages ──
export const Navbar = () => (
  <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb' }}>
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M14 3C10.5 3 8 5.5 7 8C6.2 10 6 12.5 6.5 15C7 17 7.5 19.5 8 21.5C8.5 23.5 9.5 25 11 25C12.5 25 13 23 13.5 21C13.8 19.5 14 18 14 18C14 18 14.2 19.5 14.5 21C15 23 15.5 25 17 25C18.5 25 19.5 23.5 20 21.5C20.5 19.5 21 17 21.5 15C22 12.5 21.8 10 21 8C20 5.5 17.5 3 14 3Z" fill="#2A9D8F"/>
          </svg>
          <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1C1917', fontFamily: 'Lora, Georgia, serif' }}>PearlDesk</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login"    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '500', color: '#6B5C52', textDecoration: 'none' }}>Login</Link>
          <Link to="/register" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: 'white', backgroundColor: '#2A9D8F', borderRadius: '0.375rem', textDecoration: 'none' }}>Register</Link>
        </div>
      </div>
    </div>
  </nav>
);

// Load external scripts dynamically (Bootstrap JS + GSAP)
function useExternalScript(src) {
  useEffect(() => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      // leave scripts in DOM — removing them can break other pages
    };
  }, [src]);
}

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [openFaq, setOpenFaq]             = useState(0);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [scrolled, setScrolled]           = useState(false);

  // Only load GSAP — Bootstrap JS no longer needed (no BS components used)
  useExternalScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
  useExternalScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');

  // React-controlled scroll detection for navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 992) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // GSAP animations
  useEffect(() => {
    const init = () => {
      if (!window.gsap || !window.ScrollTrigger) return;
      const gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.innerWidth < 992;
      if (prefersReduced) return;

      // Page load timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('#mainNav',       { y: -60, opacity: 0, duration: 0.6 })
        .from('.hero-eyebrow',  { opacity: 0, y: 16, duration: 0.5 }, '-=0.2')
        .from('.hero-word',     { clipPath: 'inset(0 100% 0 0)', opacity: 0, stagger: 0.08, duration: 0.6 }, '-=0.1')
        .from('.hero-sub',      { opacity: 0, y: 12, duration: 0.5 }, '-=0.2')
        .from('.hero-ctas',     { opacity: 0, y: 12, duration: 0.5 }, '-=0.2')
        .from('.hero-mockup',   { x: isMobile ? 0 : 80, y: isMobile ? 40 : 0, opacity: 0, duration: 1, ease: 'power2.out' }, '-=0.6');

      // Idle float desktop only
      if (!isMobile) {
        gsap.to('.hero-mockup', { y: -10, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      }

      // Feature cards
      gsap.from('.feature-card', {
        y: 40, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: '#features .row', start: 'top 85%' },
      });

      // Steps
      gsap.from('.step-item', {
        y: 30, opacity: 0, stagger: 0.15, duration: 0.6,
        scrollTrigger: { trigger: '#how-it-works', start: 'top 80%' },
      });

      // Scalability cards
      gsap.from('.scale-card-left', {
        x: -40, opacity: 0, duration: 0.7,
        scrollTrigger: { trigger: '.scale-section', start: 'top 80%' },
      });
      gsap.from('.scale-card-right', {
        x: isMobile ? 0 : 40, y: isMobile ? 20 : 0, opacity: 0, duration: 0.7, delay: 0.1,
        scrollTrigger: { trigger: '.scale-section', start: 'top 80%' },
      });
    };

    const interval = setInterval(() => {
      if (window.gsap && window.ScrollTrigger) { clearInterval(interval); init(); }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  // Smooth scroll helper for nav links (handles hash + closes menu)
  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">

      {/* ── NAVBAR ── */}
      <nav
        id="mainNav"
        aria-label="Main navigation"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1030,
          background: scrolled ? 'white' : 'transparent',
          boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
          borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, gap: '1rem' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 3C10.5 3 8 5.5 7 8C6.2 10 6 12.5 6.5 15C7 17 7.5 19.5 8 21.5C8.5 23.5 9.5 25 11 25C12.5 25 13 23 13.5 21C13.8 19.5 14 18 14 18C14 18 14.2 19.5 14.5 21C15 23 15.5 25 17 25C18.5 25 19.5 23.5 20 21.5C20.5 19.5 21 17 21.5 15C22 12.5 21.8 10 21 8C20 5.5 17.5 3 14 3Z" fill="#2A9D8F"/>
              <path d="M10 9C10 9 9.5 11 10 13" stroke="#1B7A6E" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: 'Lora, Georgia, serif', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>
              PearlDesk
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul style={{ display: 'none', listStyle: 'none', margin: 0, padding: 0, gap: '0.25rem', alignItems: 'center' }}
              className="d-none d-lg-flex">
            {[['features','Features'],['how-it-works','How It Works'],['faq','FAQ'],['contact','Contact']].map(([id, label]) => (
              <li key={id}>
                <button onClick={() => scrollTo(id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.5rem 0.75rem', fontWeight: 500, fontSize: '0.9375rem',
                  color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif",
                  borderRadius: 6, transition: 'color 0.15s ease, background 0.15s ease',
                }}
                onMouseEnter={e => { e.target.style.color = 'var(--primary)'; e.target.style.background = 'rgba(42,157,143,0.06)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'none'; }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop CTA buttons */}
          <div className="d-none d-lg-flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
            <Link to="/login" style={{
              padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.875rem',
              color: 'var(--primary)', border: '1.5px solid var(--primary)',
              borderRadius: 8, textDecoration: 'none', transition: 'all 0.15s ease',
              background: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
            >
              Sign In
            </Link>
            <button onClick={() => scrollTo('contact')} style={{
              padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.875rem',
              color: 'white', background: 'var(--primary)', border: 'none',
              borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
            >
              Contact Sales
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="d-lg-none"
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              background: 'none', border: '1.5px solid var(--border)',
              borderRadius: 8, padding: '0.5rem', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 5,
              width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.15s ease',
            }}
          >
            <span style={{ width: 20, height: 2, background: menuOpen ? 'var(--primary)' : 'var(--text)', borderRadius: 2, transition: 'transform 0.25s ease, opacity 0.25s ease', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }}></span>
            <span style={{ width: 20, height: 2, background: 'var(--text)', borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.25s ease' }}></span>
            <span style={{ width: 20, height: 2, background: menuOpen ? 'var(--primary)' : 'var(--text)', borderRadius: 2, transition: 'transform 0.25s ease, opacity 0.25s ease', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }}></span>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        <div style={{
          maxHeight: menuOpen ? 400 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
          background: 'white',
          borderTop: menuOpen ? '1px solid var(--border)' : 'none',
        }}
        className="d-lg-none"
        >
          <div className="container" style={{ padding: '1rem 1rem 1.5rem' }}>
            {[['features','Features'],['how-it-works','How It Works'],['faq','FAQ'],['contact','Contact']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.75rem 0', fontWeight: 500, fontSize: '1rem',
                color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif",
                borderBottom: '1px solid var(--border)',
              }}>
                {label}
              </button>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.75rem', fontWeight: 600, fontSize: '0.9375rem',
                color: 'var(--primary)', border: '1.5px solid var(--primary)',
                borderRadius: 8, textDecoration: 'none', minHeight: 48,
              }}>
                Sign In
              </Link>
              <button onClick={() => scrollTo('contact')} style={{
                padding: '0.75rem', fontWeight: 600, fontSize: '0.9375rem',
                color: 'white', background: 'var(--primary)', border: 'none',
                borderRadius: 8, cursor: 'pointer', minHeight: 48,
              }}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section" aria-label="Hero">
        <div className="hero-blob" aria-hidden="true"></div>
        <div className="hero-blob-2" aria-hidden="true"></div>
        <div className="container hero-content">
          <div className="row align-items-center gy-5">
            <div className="col-12 col-lg-6">
              <span className="badge rounded-pill hero-eyebrow mb-3 d-inline-flex">
                Dental Practice Management &nbsp;·&nbsp; Multi-Tenant
              </span>
              <h1 className="hero-title mb-3">
                <span className="hero-word">Your</span>{' '}
                <span className="hero-word">practice,</span>
                <span className="d-block">
                  <span className="hero-word">perfectly</span>{' '}
                  <span className="hero-word">managed.</span>
                </span>
              </h1>
              <p className="hero-sub mb-4">
                From solo practitioners to multi-branch chains — patient records, dental charting,
                smart scheduling, and treatment plans all in one place.
              </p>
              <div className="hero-ctas d-grid gap-2 d-lg-flex">
                <a href="#contact" className="btn btn-accent btn-lg px-5">Contact Sales</a>
                <a href="#how-it-works" className="btn btn-outline-primary btn-lg px-5">See How It Works</a>
              </div>
              <p className="hero-social-proof mt-3 mb-0">
                <span style={{ color: 'var(--primary)' }}>✦</span>
                {' '}Trusted by growing clinics across the Philippines and beyond
              </p>
            </div>

            {/* Mockup column */}
            <div className="col-12 col-lg-6 hero-mockup">
              {/* Mobile mockup */}
              <div className="mockup-shell d-lg-none" style={{ maxHeight: 280, overflow: 'hidden' }}>
                <div className="p-3" style={{ background: 'var(--bg)' }}>
                  <div className="mockup-topbar">
                    <span className="mockup-topbar-title">Dashboard</span>
                    <div className="mockup-avatar">JD</div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-4">
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-label">Today</div>
                        <div className="mockup-stat-value">8</div>
                        <div className="mockup-stat-badge">appts</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-label">Patients</div>
                        <div className="mockup-stat-value">142</div>
                        <div className="mockup-bar mt-1"><div className="fill" style={{ width: '70%' }}></div></div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="mockup-stat-card">
                        <div className="mockup-stat-label">Plans</div>
                        <div className="mockup-stat-value">23</div>
                        <div className="mockup-bar mt-1"><div className="fill" style={{ width: '45%', background: 'var(--accent)' }}></div></div>
                      </div>
                    </div>
                  </div>
                  <div className="mockup-patient-row">
                    <div className="mockup-patient-avatar">MR</div>
                    <div>
                      <div className="mockup-patient-name">Maria Reyes</div>
                      <div className="mockup-patient-sub">10:30 AM · Cleaning</div>
                    </div>
                    <div className="mockup-status-dot"></div>
                  </div>
                </div>
              </div>

              {/* Desktop mockup */}
              <div className="mockup-shell d-none d-lg-flex" style={{ height: 360 }}>
                <div className="mockup-sidebar">
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M7 1.5C5.25 1.5 4 2.75 3.5 4C3.1 5 3 6.25 3.25 7.5C3.5 8.5 3.75 9.75 4 10.75C4.25 11.75 4.75 12.5 5.5 12.5C6.25 12.5 6.5 11.5 6.75 10.5C6.9 9.75 7 9 7 9C7 9 7.1 9.75 7.25 10.5C7.5 11.5 7.75 12.5 8.5 12.5C9.25 12.5 9.75 11.75 10 10.75C10.25 9.75 10.5 8.5 10.75 7.5C11 6.25 10.9 5 10.5 4C10 2.75 8.75 1.5 7 1.5Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="mockup-sidebar-icon active"><i className="bi bi-speedometer2" style={{ color: 'white', fontSize: 12 }}></i></div>
                  <div className="mockup-sidebar-icon"><i className="bi bi-people" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}></i></div>
                  <div className="mockup-sidebar-icon"><i className="bi bi-calendar2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}></i></div>
                  <div className="mockup-sidebar-icon"><i className="bi bi-clipboard2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}></i></div>
                  <div style={{ marginTop: 'auto' }} className="mockup-sidebar-icon"><i className="bi bi-gear" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}></i></div>
                </div>
                <div className="mockup-content" style={{ overflow: 'hidden' }}>
                  <div className="mockup-topbar">
                    <div>
                      <div className="mockup-topbar-title">Good morning, Dr. Cruz ☀️</div>
                      <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>BrightSmile Dental · Main Branch</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ fontSize: 9, background: 'rgba(42,157,143,0.1)', color: 'var(--primary-dark)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>Admin</div>
                      <div className="mockup-avatar">DC</div>
                    </div>
                  </div>
                  <div className="row g-2 mb-1">
                    {[['Appts Today','12','75%','var(--primary)'],['Total Patients','248','60%','var(--primary)'],['Pending Plans','31','40%','var(--accent)'],['Completed','18','85%','#3D9970']].map(([label,val,w,color]) => (
                      <div className="col-3" key={label}>
                        <div className="mockup-stat-card">
                          <div className="mockup-stat-label">{label}</div>
                          <div className="mockup-stat-value">{val}</div>
                          <div className="mockup-bar mt-1"><div className="fill" style={{ width: w, background: color }}></div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mockup-section-title">Today's Schedule</div>
                  {[
                    { initials:'MR', name:'Maria Reyes',   time:'10:30 AM · Prophylaxis',      color:'linear-gradient(135deg,var(--primary-light),var(--primary))', status:'' },
                    { initials:'JD', name:'Jose Dela Cruz', time:'11:00 AM · Tooth Extraction',  color:'linear-gradient(135deg,#F4B942,#E76F51)', status:'pending' },
                    { initials:'AS', name:'Ana Santos',     time:'2:00 PM · Orthodontic Check',  color:'linear-gradient(135deg,#8B5CF6,#6D28D9)', status:'' },
                  ].map(p => (
                    <div className="mockup-patient-row" key={p.name}>
                      <div className="mockup-patient-avatar" style={{ background: p.color }}>{p.initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="mockup-patient-name">{p.name}</div>
                        <div className="mockup-patient-sub">{p.time}</div>
                      </div>
                      <div className={`mockup-status-dot ${p.status}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <div className="social-proof-bar py-3" aria-label="Trusted by">
        <div className="container">
          <p className="text-center mb-2" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Trusted by growing dental practices across the Philippines and beyond
          </p>
        </div>
        <div className="marquee-outer py-1">
          <div className="marquee-track" aria-hidden="true">
            {['BrightSmile Dental','OrthoCare PH','KidsDent Clinic','AllSmiles Group','MetroDental','Smile Studio PH','PrimeDent Care',
              'BrightSmile Dental','OrthoCare PH','KidsDent Clinic','AllSmiles Group','MetroDental','Smile Studio PH','PrimeDent Care'].map((name, i) => (
              <span className="marquee-item" key={i}>
                <span className="marquee-dot"></span>{name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-5 py-lg-6" style={{ background: 'var(--surface)' }} aria-labelledby="features-heading">
        <div className="container">
          <div className="text-center mb-2">
            <p className="section-eyebrow">Features</p>
            <h2 className="section-heading" id="features-heading">Everything your clinic needs</h2>
            <p className="section-sub">
              PearlDesk brings together every tool a modern dental practice requires — in one warm, intuitive platform.
            </p>
          </div>
          <div className="row g-4 mt-2">
            {[
              { icon: 'bi-person-lines-fill', title: 'Complete Patient Profiles',    body: 'Full medical history, visit timeline, documents, and contact info — instantly accessible. No more paper charts or scattered records.' },
              { icon: 'bi-grid-3x3-gap-fill', title: 'Interactive Dental Charts',    body: 'Adult and pediatric tooth charts with per-tooth condition tracking. Click any tooth to log caries, fillings, crowns, and more.' },
              { icon: 'bi-calendar2-check',   title: 'Smart Scheduling',             body: 'Day, week, and month views. Color-coded by dentist or appointment type. Reduce no-shows with built-in reminders.' },
              { icon: 'bi-clipboard2-pulse',  title: 'Treatment Plan Tracking',      body: 'Create, assign, and track treatment plans from Planned to Completed. Cost estimates and procedure notes in one view.' },
            ].map(f => (
              <div className="col-12 col-md-6" key={f.title}>
                <div className="card feature-card h-100 border-0 shadow-sm rounded-4 p-3 p-lg-4">
                  <div className="card-body p-0">
                    <div className="feature-icon">
                      <i className={`bi ${f.icon}`} aria-hidden="true"></i>
                    </div>
                    <h3 className="h5 fw-bold mb-2" style={{ fontFamily: "'DM Sans',sans-serif" }}>{f.title}</h3>
                    <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.65 }}>{f.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-5 py-lg-6" style={{ background: 'var(--bg)' }} aria-labelledby="hiw-heading">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-eyebrow">Getting Started</p>
            <h2 className="section-heading" id="hiw-heading">Up and running in minutes</h2>
            <p className="section-sub">No lengthy onboarding. No IT team required. Just sign up and start seeing patients.</p>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="d-lg-none">
            {[
              { n:'1', icon:'bi-gear-fill',          title:'Set up your clinic',  body:'Add your branch, configure roles, and invite your team. Multi-branch? Add all locations in one account.' },
              { n:'2', icon:'bi-person-plus-fill',   title:'Add your patients',   body:'Import existing records or register new patients. Dental charts are ready to fill from day one.' },
              { n:'3', icon:'bi-graph-up-arrow',     title:'Start managing',      body:'Schedule appointments, log treatments, and track progress — all in one dashboard.' },
            ].map((s, i, arr) => (
              <div key={s.n}>
                <div className="d-flex gap-3 step-item align-items-start">
                  <div className="d-flex flex-column align-items-center">
                    <div className="step-number-badge flex-shrink-0">{s.n}</div>
                  </div>
                  <div className="pb-2 pt-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className={`bi ${s.icon}`} style={{ color: 'var(--primary)', fontSize: '1rem' }} aria-hidden="true"></i>
                      <h3 className="mb-0 fw-bold" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '1rem' }}>{s.title}</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: 0 }}>{s.body}</p>
                  </div>
                </div>
                {i < arr.length - 1 && <div className="step-connector-mobile" aria-hidden="true"></div>}
              </div>
            ))}
          </div>

          {/* Desktop: card row with connector */}
          <div className="d-none d-lg-block">
            <div className="row g-4 justify-content-center align-items-stretch position-relative">
              {/* Connector line behind the cards */}
              <div aria-hidden="true" style={{
                position: 'absolute',
                top: 44,
                left: 'calc(16.67% + 44px)',
                width: 'calc(66.67% - 88px)',
                height: 2,
                background: 'linear-gradient(to right, var(--primary), var(--primary-light), var(--primary))',
                opacity: 0.25,
                zIndex: 0,
              }}></div>

              {[
                { n:'1', icon:'bi-gear-fill',          title:'Set up your clinic', body:'Add your branch, configure roles, and invite your team. Multi-branch? Add all locations in one account.' },
                { n:'2', icon:'bi-person-plus-fill',   title:'Add your patients',  body:'Import existing records or register new patients. Dental charts are ready to fill from day one.' },
                { n:'3', icon:'bi-graph-up-arrow',     title:'Start managing',     body:'Schedule appointments, log treatments, and track progress — all in one dashboard.' },
              ].map((s, i) => (
                <div className="col-12 col-md-4 step-item" key={s.n} style={{ position: 'relative', zIndex: 1 }}>
                  <div className="h-100 text-center p-4 rounded-4" style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  }}>
                    {/* Step badge */}
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: '50%',
                      background: i === 1 ? 'var(--primary)' : 'rgba(42,157,143,0.1)',
                      color: i === 1 ? 'white' : 'var(--primary)',
                      fontWeight: 700, fontSize: '1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      fontFamily: "'Lora', serif",
                      boxShadow: i === 1 ? '0 4px 16px rgba(42,157,143,0.35)' : 'none',
                    }}>{s.n}</div>
                    {/* Icon */}
                    <div style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: 'rgba(42,157,143,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1rem',
                    }}>
                      <i className={`bi ${s.icon}`} style={{ fontSize: '1.5rem', color: 'var(--primary)' }} aria-hidden="true"></i>
                    </div>
                    <h3 className="fw-bold mb-2" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '1.0625rem', color: 'var(--text)' }}>{s.title}</h3>
                    <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.65 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SCALABILITY ── */}
      <section className="py-5 py-lg-6 scale-section" style={{ background: 'var(--surface)' }} aria-label="Who is PearlDesk for">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-eyebrow">Built to Scale</p>
            <h2 className="section-heading">Made for every kind of practice</h2>
          </div>
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="scale-card-left rounded-4 p-4 p-lg-5 h-100">
                <div className="scale-icon-wrap teal">
                  <i className="bi bi-person-fill" aria-hidden="true"></i>
                </div>
                <h3 className="fw-bold mb-2" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '1.25rem' }}>Solo practice?</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  PearlDesk is lightweight enough for a single dentist. Get started free and grow at your own pace.
                </p>
                <a href="#contact" className="btn btn-outline-primary btn-sm mt-2">Get Started</a>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="scale-card-right rounded-4 p-4 p-lg-5 h-100">
                <div className="scale-icon-wrap white">
                  <i className="bi bi-diagram-3-fill" aria-hidden="true"></i>
                </div>
                <h3 className="fw-bold mb-2" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '1.25rem' }}>Growing chain?</h3>
                <p style={{ lineHeight: 1.65 }}>
                  Multi-tenant architecture with branch management, role-based access, and a SysAdmin dashboard built to scale.
                </p>
                <a href="#contact" className="btn btn-light btn-sm mt-2">Talk to Sales</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-5 py-lg-6" style={{ background: 'var(--bg)' }} aria-labelledby="faq-heading">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-eyebrow">FAQ</p>
            <h2 className="section-heading" id="faq-heading">Frequently asked questions</h2>
          </div>
          <div className="mx-auto" style={{ maxWidth: 720 }}>
            {[
              { q:'Is PearlDesk suitable for a single-dentist clinic?',      a:'Absolutely. PearlDesk is designed to scale — start solo and add branches and users as you grow.' },
              { q:'How does multi-tenant work?',                             a:'Each clinic gets its own isolated data environment. A SysAdmin can oversee all tenants from a central dashboard.' },
              { q:'What roles are supported?',                              a:'SysAdmin, Clinic Admin, Dentist, and Receptionist — each with tailored access and views.' },
              { q:'Is the dental chart compatible with pediatric patients?', a:'Yes. PearlDesk includes both a standard 32-tooth adult chart and a 20-tooth pediatric chart, togglable per patient.' },
              { q:'Can I import existing patient records?',                 a:'Yes, we support CSV import and can assist with data migration during onboarding.' },
              { q:'Is PearlDesk cloud-based?',                             a:'Yes. Access it from any browser, on any device. No installation required.' },
              { q:'How do I get started?',                                  a:'Click "Contact Sales" and our team will set up a personalized demo for your clinic\'s needs.' },
            ].map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={{
                  background: 'var(--surface)',
                  border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 12,
                  marginBottom: 8,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                  boxShadow: isOpen ? '0 4px 16px rgba(42,157,143,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '1.1rem 1.5rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: isOpen ? 'var(--primary)' : 'var(--text)',
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      fontFamily: "'DM Sans', sans-serif",
                      minHeight: 56,
                      transition: 'color 0.2s ease',
                    }}
                  >
                    <span>{item.q}</span>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: isOpen ? 'var(--primary)' : 'var(--surface-raised)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s ease, transform 0.25s ease',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                    }}>
                      <i className="bi bi-plus" style={{ color: isOpen ? 'white' : 'var(--text-muted)', fontSize: '1rem', lineHeight: 1 }}></i>
                    </span>
                  </button>
                  <div style={{
                    maxHeight: isOpen ? 300 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}>
                    <p style={{
                      margin: 0,
                      padding: '0 1.5rem 1.25rem',
                      color: 'var(--text-muted)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.7,
                    }}>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="contact-section py-5 py-lg-6" aria-labelledby="contact-heading">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Get In Touch</p>
            <h2 className="section-heading" id="contact-heading" style={{ color: 'white' }}>Let's set up your clinic</h2>
            <p className="section-sub" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Tell us about your practice and we'll reach out within 24 hours.
            </p>
          </div>
          <div className="mx-auto" style={{ maxWidth: 680 }}>
            {formSubmitted ? (
              <div className="contact-success">
                <span className="success-icon">🦷</span>
                <h3 style={{ fontFamily: "'Lora',serif", marginBottom: '0.5rem' }}>Thanks! We'll be in touch within 24 hours.</h3>
                <p style={{ opacity: 0.85, marginBottom: 0 }}>We're excited to help your practice grow with PearlDesk.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="contactName">Your Name</label>
                    <input type="text" className="form-control" id="contactName" placeholder="Dr. Juan dela Cruz" required />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="contactClinic">Clinic Name</label>
                    <input type="text" className="form-control" id="contactClinic" placeholder="BrightSmile Dental" required />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="contactEmail">Email Address</label>
                    <input type="email" className="form-control" id="contactEmail" placeholder="you@example.com" required />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="contactPhone">Phone Number</label>
                    <input type="tel" className="form-control" id="contactPhone" placeholder="+63 912 345 6789" />
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="contactMessage">Message</label>
                    <textarea className="form-control" id="contactMessage" rows="4"
                              placeholder="Tell us about your clinic — number of dentists, branches, what you're looking for..."></textarea>
                  </div>
                  <div className="col-12 d-flex justify-content-end">
                    <button type="submit" className="btn btn-light px-5 fw-semibold w-100 w-lg-auto">
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer py-5" aria-label="Site footer">
        <div className="container">
          <div className="row gy-4">
            <div className="col-12 col-md-4 text-center text-md-start">
              <div className="d-flex align-items-center gap-2 justify-content-center justify-content-md-start mb-2">
                <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M14 3C10.5 3 8 5.5 7 8C6.2 10 6 12.5 6.5 15C7 17 7.5 19.5 8 21.5C8.5 23.5 9.5 25 11 25C12.5 25 13 23 13.5 21C13.8 19.5 14 18 14 18C14 18 14.2 19.5 14.5 21C15 23 15.5 25 17 25C18.5 25 19.5 23.5 20 21.5C20.5 19.5 21 17 21.5 15C22 12.5 21.8 10 21 8C20 5.5 17.5 3 14 3Z" fill="#2A9D8F"/>
                </svg>
                <span className="footer-logo">PearlDesk</span>
              </div>
              <p className="footer-tagline">Your practice, perfectly managed.</p>
              <div className="footer-social d-flex gap-2 mt-3 justify-content-center justify-content-md-start">
                <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <p className="footer-heading">Product</p>
              <a href="#features">Features</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Pricing</a>
            </div>
            <div className="col-6 col-md-2">
              <p className="footer-heading">Company</p>
              <a href="#contact">About</a>
              <a href="#contact">Contact</a>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', display: 'block', padding: '3px 0', minHeight: 32, lineHeight: 1.6, fontSize: '0.875rem', transition: 'color 0.15s ease' }}>Sign In</Link>
            </div>
            <div className="col-12 col-md-4 text-center text-md-end d-flex align-items-end justify-content-center justify-content-md-end">
              <p className="footer-legal mb-0">© 2025 PearlDesk. All rights reserved.</p>
            </div>
          </div>
          <hr className="border-secondary mt-4 mb-3" />
          <p className="footer-legal text-center mb-0">
            Built for dental professionals who care about great patient experiences.
          </p>
        </div>
      </footer>

    </div>
  );
}
