import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();

  useEffect(() => {
    const bcrypt = window.dcodeIO.bcrypt;

    document.getElementById('loginForm').addEventListener('submit', async function (e) {
      e.preventDefault();

      function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
      }

      function setOTPExpiration() {
        return Date.now() + 5 * 60 * 1000; // 5 minutes
      }

      const username = document.querySelector('input[placeholder="username"]').value;
      const email = document.querySelector('input[placeholder="Email address"]').value;
      const password = document.querySelector('input[placeholder="password"]').value;

      const rawsalt = window.CryptoJS.lib.WordArray.random(16);
      const salt = window.CryptoJS.enc.Hex.stringify(rawsalt);
      const saltedPassword = password + salt;
      const hashedPassword = await bcrypt.hash(saltedPassword, 10);

      const otpCode = generateOTP();
      const otpExpiration = setOTPExpiration();

      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      localStorage.setItem('salt', salt);
      localStorage.setItem('hashedPassword', hashedPassword);
      localStorage.setItem('otpCode', otpCode);
      localStorage.setItem('otpExpiration', otpExpiration);

      console.log('OTP Code:', otpCode);
      console.log('OTP will expire at:', new Date(otpExpiration));

      const otpOutput = document.getElementById('otpOutput');
      otpOutput.innerHTML = `Registration successful! OTP sent to: ${email}. Enter the sent passcode to verify you. Passcode expires in 5 minutes.`;
      otpOutput.style.display = 'block';

      function verifyOTP() {
        const enteredOTP = document.getElementById('otpInput').value;
        const savedOTP = localStorage.getItem('otpCode');
        const expiration = parseInt(localStorage.getItem('otpExpiration'));
        const tries = parseInt(localStorage.getItem('otpTries')) || 0;
        const now = Date.now();

        const blockedUntil = parseInt(localStorage.getItem('otpBlockedUntil') || '0');
        if (now < blockedUntil) {
          alert('Too many tries! Please try again after 1 hour.');
          return;
        }

        const nextTryTime = parseInt(localStorage.getItem('otpNextTryTime') || '0');
        if (now < nextTryTime) {
          alert(`Please wait ${Math.ceil((nextTryTime - now) / 1000)} seconds before retrying.`);
          return;
        }

        if (Date.now() > expiration) {
          alert('OTP expired. Please register again.');
          return;
        }

        if (enteredOTP === savedOTP) {
          navigate('/home');

          localStorage.removeItem('otpTries');
          localStorage.removeItem('otpCode');
          localStorage.removeItem('otpExpiration');
        } else {
          let newTries = tries + 1;
          localStorage.setItem('otpTries', newTries);

          if (newTries === 1) {
            localStorage.setItem('otpNextTryTime', now + 10000); // 10s
          } else if (newTries === 2) {
            localStorage.setItem('otpNextTryTime', now + 30000); // 30s
          } else {
            localStorage.setItem('otpBlockedUntil', now + 60 * 60 * 1000); // 1h
            localStorage.removeItem('otpCode');
            localStorage.removeItem('otpExpiration');
            alert('Too many wrong tries!');
            return;
          }

          const newOTP = generateOTP();
          const newExpiration = Date.now() + 5 * 60 * 1000;
          localStorage.setItem('otpCode', newOTP);
          localStorage.setItem('otpExpiration', newExpiration);
          alert('Wrong OTP. A new one was sent to your email. Wait before retrying.');
          console.log('New OTP:', newOTP);
        }
      }

      fetch('otpsection.html')
        .then((response) => response.text())
        .then((data) => {
          document.getElementById('otpContainer').innerHTML = data;
          document.getElementById('otpSection').style.display = 'block';
          document.getElementById('verifyBtn').addEventListener('click', verifyOTP);
        });
    });
  }, [navigate]);

  return (
    <>
      <h1>Welcome to stellars!</h1>
      <form id="loginForm">
        <label htmlFor="username">Username</label>
        <input type="text" placeholder="username" required />

        <label htmlFor="email">Email Address</label>
        <input type="email" placeholder="Email address" required />

        <label htmlFor="password">Password</label>
        <input type="password" placeholder="password" required />

        <button type="submit">Sign Up</button>
      </form>

      <p id="otpOutput"></p>
      <div id="otpContainer"></div>
    </>
  );
}

export default Signup;
