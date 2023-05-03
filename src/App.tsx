import drugoLogo from './assets/drugo.jpg'
import twitterLogo from './assets/twitter.svg'
import linkedinLogo from './assets/linkedin.svg'
import unsplashLogo from './assets/unsplash.svg'
import githubLogo from './assets/github.svg'
import './App.css'

function App() {

  return (
    <>
      <header class="navbar nav">
        <nav aria-label="Site sections">
          <ul role="list">
            <li><a href="/me">About me</a></li>
            <li><a href="#">Articles</a></li>
          </ul>
        </nav>
        <nav class="pull-right" aria-label="Social media links">
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
      <div class="content">
      <a href="">
        <img src={drugoLogo} className="roundlogo" alt="Drugo logo" />
      </a>

      <h2> Welcome to my personal website! </h2>

      <p>Hi! My name is Enrico but people call me Drugo.</p>

      </div>
    </>
  )
}

export default App
