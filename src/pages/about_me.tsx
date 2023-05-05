import drugoLogo from '../assets/drugo.jpg'

function About() {

  return (
    <div className="text-centered">
    <a href="">
      <img src={drugoLogo} className="roundlogo" alt="Drugo logo" />
    </a>

    <h2> Welcome to my personal website! </h2>

    <p>Hi! My name is Enrico but people call me Drugo.</p>
    </div>
  )
}

export default About;
