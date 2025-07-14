import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const bcrypt = window.dcodeIO.bcrypt;

    const loginForm = document.getElementById('loginForm');
    const resetLink = document.getElementById('resetLink');
    const resetBtn = document.getElementById('resetBtn');

    const handleSubmit = async (e) => {
      e.preventDefault();

      const enteredUser = document.getElementById('email').value;
      const enteredPassword = document.getElementById('password').value;

      const storedEmail = localStorage.getItem('email');
      const storedUsername = localStorage.getItem('username');
      const storedHashedPassword = localStorage.getItem('hashedPassword');
      const storedSalt = localStorage.getItem('salt');

      const messageEl = document.getElementById('message');

      if (!storedEmail || !storedUsername || !storedHashedPassword || !storedSalt) {
        messageEl.textContent = '❌ No user found. Please sign up first.';
        return;
      }

      // Allow login via either email or username
      if (enteredUser !== storedEmail && enteredUser !== storedUsername) {
        messageEl.textContent = '❌ Wrong email or username!';
        return;
      }

      const saltedEnteredPassword = enteredPassword + storedSalt;
      const match = await bcrypt.compare(saltedEnteredPassword, storedHashedPassword);

      if (match) {
        messageEl.textContent = '✅ Login successful! Redirecting...';

        // Mark that user needs to enter backup code in Home
        localStorage.setItem("pendingBackupCode", "true");

        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        messageEl.textContent = '❌ Incorrect password!';
      }
    };

    const handleResetLink = (e) => {
      e.preventDefault();
      document.getElementById('resetSection').style.display = 'block';
    };

    const handleReset = () => {
      const email = document.getElementById('resetEmail').value;
      if (email) {
        alert(`📧 A reset code has been sent to "${email}" (simulated email)`);
      } else {
        alert('Please enter your email first.');
      }
    };

    loginForm?.addEventListener('submit', handleSubmit);
    resetLink?.addEventListener('click', handleResetLink);
    resetBtn?.addEventListener('click', handleReset);

    return () => {
      loginForm?.removeEventListener('submit', handleSubmit);
      resetLink?.removeEventListener('click', handleResetLink);
      resetBtn?.removeEventListener('click', handleReset);
    };
  }, [navigate]);

  return (
    <>
      <h1>Login to Your Account</h1>

      <form id="loginForm">
        <label htmlFor="email">Username or Email</label>
        <input type="text" id="email" placeholder="username or email@example.com" required />

        <label htmlFor="password">Password</label>
        <input type="password" id="password" placeholder="password" required />

        <button type="submit">Login</button>
      </form>

      <p id="message" style={{ color: 'green', textAlign: 'center' }}></p>

      <p style={{ textAlign: 'center' }}>
        <a href="#" id="resetLink">Forgot Password?</a>
      </p>

      <div id="resetSection" style={{ display: 'none', textAlign: 'center' }}>
        <h3>Reset Password</h3>
        <input type="email" id="resetEmail" placeholder="Enter your email" />
        <button id="resetBtn">Send Reset Code</button>
      </div>
    </>
  );
}

export default Login;
