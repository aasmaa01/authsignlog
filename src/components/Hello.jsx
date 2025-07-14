import {useNavigate} from 'react-router-dom';


function Hello() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>CyberCombat 2025 by IT section MICRO CLUB</h1>

      <div id="actionContainer">
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/signup')}>Sign Up</button>
      </div>
    </div>
  )
}

export default Hello
