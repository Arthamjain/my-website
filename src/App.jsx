import { useEffect, useState } from 'react'
import './App.css'

const features = [
  {
    icon: '⚡',
    title: 'Lightning fast',
    text: 'Built on Vite for instant server start and near-instant hot module replacement.',
  },
  {
    icon: '🎨',
    title: 'Thoughtful design',
    text: 'Clean typography, generous spacing and a palette that adapts to light and dark mode.',
  },
  {
    icon: '📱',
    title: 'Fully responsive',
    text: 'Looks great on every screen, from a small phone to a wide desktop monitor.',
  },
  {
    icon: '🧩',
    title: 'Component driven',
    text: 'Written in React so every section is easy to reuse, extend and maintain.',
  },
]

const steps = [
  { n: '01', title: 'Plan', text: 'Define the goals, audience and content for your site.' },
  { n: '02', title: 'Build', text: 'Compose pages from small, focused React components.' },
  { n: '03', title: 'Ship', text: 'Run a production build and deploy anywhere static files are served.' },
]

const year = new Date().getFullYear()

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'system'
    } catch {
      return 'system'
    }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // storage unavailable; theme still applies for this session
    }
  }, [theme])

  const toggleTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
    setTheme(isDark ? 'light' : 'dark')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <a href="#" className="logo">
            <span className="logo-mark" aria-hidden="true" />
            Nova
          </a>
          <nav className={`nav-links ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
            <a href="#features">Features</a>
            <a href="#process">Process</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle color theme">
              ◐
            </button>
            <button
              className="icon-btn menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <span className="eyebrow">Now built with Vite + React</span>
            <h1>
              Build something <span className="gradient">beautiful</span>, faster.
            </h1>
            <p className="lead">
              A clean, modern starting point for your next idea. Simple to read, easy to
              extend and ready to ship.
            </p>
            <div className="hero-cta">
              <a href="#contact" className="btn btn-primary">Get started</a>
              <a href="#features" className="btn btn-ghost">Learn more →</a>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="container">
            <h2 className="section-title">Everything you need</h2>
            <p className="section-sub">A solid foundation with the essentials already in place.</p>
            <div className="grid">
              {features.map((f) => (
                <article className="card" key={f.title}>
                  <div className="card-icon" aria-hidden="true">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="section section-alt">
          <div className="container">
            <h2 className="section-title">How it works</h2>
            <p className="section-sub">Three simple steps from idea to launch.</p>
            <ol className="steps">
              {steps.map((s) => (
                <li className="step" key={s.n}>
                  <span className="step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="container">
            <div className="cta-box">
              <h2>Stay in the loop</h2>
              <p>Get occasional updates. No spam, unsubscribe anytime.</p>
              {submitted ? (
                <p className="success">Thanks! You're on the list.</p>
              ) : (
                <form className="signup" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email address"
                  />
                  <button type="submit" className="btn btn-primary">Subscribe</button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>© {year} Nova. All rights reserved.</span>
          <span>Made with Vite + React</span>
        </div>
      </footer>
    </>
  )
}

export default App
