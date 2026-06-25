import './Landing.css';

function Landing({ menuItems, onGetStarted }) {
  const scrollToMenu = () => {
    document.getElementById('menu-preview').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing">
      {/* ── HERO SECTION ── */}
      <section className="hero">
        <nav className="nav">
          <div className="nav-logo">MR.<span>Coffee</span></div>
          <div className="nav-links hide-mobile">
            <span className="nav-link">Our Story</span>
            <span className="nav-link">Menu</span>
            <span className="nav-link">Visit Us</span>
          </div>
          <button className="nav-cta" onClick={onGetStarted}>Order Now</button>
        </nav>

        <div className="hero-content">
          <p className="hero-eyebrow">Est. 2018 · Hyderabad, India</p>
          <h1 className="hero-title">
            Where Every<br />
            <em>Sip Tells</em><br />
            a Story
          </h1>
          <p className="hero-subtitle">
            Coffee is more than a drink — it's a ritual, a pause in the day,
            a moment of pure clarity. At MR. Coffee, we source single-origin
            beans and craft each cup with intention.
          </p>
          <div className="hero-cta-row">
            <button className="btn-primary" onClick={onGetStarted}>
              Get Started ↓
            </button>
            <button className="btn-ghost" onClick={scrollToMenu}>
              Explore Menu
            </button>
          </div>
        </div>

        {/* About Strip at bottom of hero */}
        <div className="about-strip">
          <div className="about-card">
            <div className="about-icon">☕</div>
            <h3>Single Origin Beans</h3>
            <p>Sourced directly from farms in Coorg, Chikmagalur and the Nilgiris — traceable from crop to cup.</p>
          </div>
          <div className="about-card">
            <div className="about-icon">🌿</div>
            <h3>Slow Roasted Daily</h3>
            <p>Every batch roasted in-house each morning. No stale pre-packaged beans. Only freshness.</p>
          </div>
          <div className="about-card">
            <div className="about-icon">🏆</div>
            <h3>Award-Winning Brews</h3>
            <p>Recognised by the India Specialty Coffee Association for excellence in taste and craft.</p>
          </div>
        </div>
      </section>

      {/* ── MENU PREVIEW SECTION ── */}
      <section className="menu-section" id="menu-preview">
        <div className="section-header">
          <p className="section-eyebrow">Our Menu</p>
          <h2 className="section-title">Crafted with Intention</h2>
        </div>
        <div className="menu-grid">
          {menuItems.slice(0, 8).map(item => (
            <div key={item.id} className="menu-card" onClick={onGetStarted}>
              <p className="menu-cat">{item.category}</p>
              <p className="menu-name">{item.itemName}</p>
              <p className="menu-price">₹{Number(item.price).toFixed(0)}</p>
            </div>
          ))}
        </div>
        <div className="menu-cta">
          <button className="btn-dark" onClick={onGetStarted}>
            Order Now — Login Required
          </button>
        </div>
      </section>
    </div>
  );
}

export default Landing;
