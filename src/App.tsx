import twitterLogo from './assets/twitter.svg'
import linkedinLogo from './assets/linkedin.svg'
import unsplashLogo from './assets/unsplash.svg'
import githubLogo from './assets/github.svg'
import './App.css'
import About from './pages/about_me'
import Article from './pages/article'
import Category from './pages/category'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'

function App() {

  return (
    <HashRouter>
      <header className="navbar nav">
        <nav aria-label="Site sections">
          <ul role="list">
            <li><a href="/">About me</a></li>
            <li>
              <div className="dropdown">
                <a href="#">Articles</a>
                <div className="dropdown-child">
                  <Link to="/articles/personal">Personal</Link>
                  <Link to="/articles/front_end">Front end</Link>
                </div>
              </div>
            </li>
          </ul>
        </nav>
        <nav className="pull-right" aria-label="Social media links">
          <ul role="list">
            <li>
              <a href="https://twitter.com/EnricoDVN" target="_blank">
                <img src={twitterLogo} className="logo medialogo" alt="Twitter logo" />
              </a>
            </li>
            <li>
              <a href="https://br.linkedin.com/in/enrico-davini-neto" target="_blank">
                <img src={linkedinLogo} className="logo medialogo" alt="LinkedIn logo" />
              </a>
            </li>
            <li>
              <a href="https://unsplash.com/@enricodvn" target="_blank">
                <img src={unsplashLogo} className="logo medialogo" alt="Unsplash logo" />
              </a>
            </li>
            <li>
              <a href="https://github.com/enricodvn" target="_blank">
                <img src={githubLogo} className="logo medialogo" alt="Github logo" />
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <div className="content">
        <Routes>
          <Route path="/" element={<About/>} />
          <Route path="/articles/:category/:article/" element={<Article />} />
          <Route path="/articles/:category/" element={<Category />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
