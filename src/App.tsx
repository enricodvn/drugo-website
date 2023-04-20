import { useState } from 'react'
import drugoLogo from './assets/drugo.jpg'
import twitterLogo from './assets/twitter.svg'
import linkedinLogo from './assets/linkedin.svg'
import unsplashLogo from './assets/unsplash.svg'
import './App.css'

function App() {

  return (
    <>
      <div>
      <a href="">
        <img src={drugoLogo} class="roundlogo" alt="Drugo logo" />
      </a>
      <h2> Hi! My name is Enrico but people call me Drugo. </h2>

      <h2> Welcome to my personal website! </h2>

      <p>Will be blog posting soon...
      but in the meantime follow me on the social media:</p>
      <p>
      <a href="https://twitter.com/EnricoDVN" target="_blank">
        <img src={twitterLogo} className="logo medialogo" alt="Twitter logo" />
      </a>
      <a href="https://br.linkedin.com/in/enrico-davini-neto" target="_blank">
        <img src={linkedinLogo} className="logo medialogo" alt="LinkedIn logo" />
      </a>
      <a href="https://unsplash.com/@enricodvn" target="_blank">
        <img src={unsplashLogo} className="logo medialogo" alt="Unsplash logo" />
      </a>
      </p>
      </div>
    </>
  )
}

export default App
