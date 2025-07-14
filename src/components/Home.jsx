import { useEffect, useState } from 'react';

function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);
  const [backupError, setBackupError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("pendingBackupCode") === "true") {
      setShowBackupPrompt(true);
    } else {
      setIsVerified(true);
    }
  }, []);

  const handleBackupVerify = () => {
    const entered = document.getElementById("backupCodeInput").value.trim();
    const validCodes = JSON.parse(localStorage.getItem("backupCodes") || "[]");

    if (validCodes.includes(entered)) {
      const remaining = validCodes.filter(code => code !== entered);
      localStorage.setItem("backupCodes", JSON.stringify(remaining));
      localStorage.removeItem("pendingBackupCode");
      setShowBackupPrompt(false);
      setIsVerified(true);
    } else {
      setBackupError("❌ Invalid backup code. Try again.");
    }
  };

  const handlePasswordVerification = async () => {
    const inputPassword = document.getElementById("verifyPassword").value;
    const storedHash = localStorage.getItem("hashedPassword");
    const storedSalt = localStorage.getItem("salt");
    const bcrypt = window.dcodeIO.bcrypt;

    const saltedInput = inputPassword + storedSalt;
    const match = await bcrypt.compare(saltedInput, storedHash);

    if (match) {
      sendOTP();
    } else {
      alert("Incorrect password. Access denied.");
    }
  };

  const sendOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = Date.now() + 5 * 60 * 1000;

    localStorage.setItem("backupOTP", otp);
    localStorage.setItem("backupOTPExpiration", expiration);

    alert("OTP sent to your email. (Demo: check console)");
    console.log("Backup OTP:", otp);

    document.getElementById("otpSection").style.display = "block";
  };

  const verifyOTP = () => {
    const enteredOTP = document.getElementById("otpInput").value;
    const savedOTP = localStorage.getItem("backupOTP");
    const expires = parseInt(localStorage.getItem("backupOTPExpiration"));

    if (Date.now() > expires) {
      alert("OTP expired. Try again.");
      return;
    }

    if (enteredOTP === savedOTP) {
      showBackupCodes();
    } else {
      alert("Invalid OTP. Try again.");
    }
  };

  const showBackupCodes = () => {
    const codes = generateBackupCodes();
    const list = document.getElementById("backupList");
    list.innerHTML = "";

    codes.forEach(code => {
      const li = document.createElement("li");
      li.textContent = code;
      list.appendChild(li);
    });

    document.getElementById("backupDisplay").style.display = "block";
  };

  const generateBackupCodes = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codes = [];

    for (let i = 0; i < 5; i++) {
      let part1 = '', part2 = '';
      for (let j = 0; j < 5; j++) {
        part1 += chars.charAt(Math.floor(Math.random() * chars.length));
        part2 += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(`${part1}-${part2}`);
    }

    localStorage.setItem("backupCodes", JSON.stringify(codes));
    return codes;
  };

  const downloadCodes = () => {
    const codes = JSON.parse(localStorage.getItem("backupCodes") || "[]");
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'backup_codes.txt';
    link.click();
  };

  // Show backup prompt (only after login)
  if (showBackupPrompt) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2>🔐 Enter Your Backup Code</h2>
        <input type="text" id="backupCodeInput" placeholder="e.g. ugy7R-gTE4T"
          style={{ padding: '0.5rem', fontSize: '1rem' }} />
        <br />
        <button onClick={handleBackupVerify} style={{ marginTop: '1rem' }}>Verify Backup Code</button>
        <p style={{ color: 'red' }}>{backupError}</p>
      </div>
    );
  }

  if (!isVerified) return null;

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      <h1>✅ Welcome here! Stellars are happy to see you 💫</h1>

      {/* ⚙️ Settings */}
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <button onClick={() => setShowSettings(!showSettings)} style={{ fontSize: '1.5rem' }}>
          ⚙️
        </button>
        {showSettings && (
          <div style={{
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '0.5rem'
          }}>
            <button id="backupcodes" onClick={() => {
              document.getElementById("verifySection").style.display = "block";
            }}>🔐 Backup Codes</button>
          </div>
        )}
      </div>

      {/* Verify Password */}
      <div id="verifySection" style={{ display: 'none', marginTop: '2rem' }}>
        <p><strong>🔐 Enter your password to confirm your identity:</strong></p>
        <input type="password" id="verifyPassword" placeholder="Your password" />
        <button id="verifyPassBtn" onClick={handlePasswordVerification}>Verify Password</button>
      </div>

      {/* OTP Verification */}
      <div id="otpSection" style={{ display: 'none', marginTop: '1rem' }}>
        <p>📲 Enter OTP code sent to your email:</p>
        <input type="text" id="otpInput" placeholder="OTP" />
        <button id="verifyOtpBtn" onClick={verifyOTP}>Verify OTP</button>
      </div>

      {/* Backup Codes Display */}
      <div id="backupDisplay" style={{
        display: 'none',
        marginTop: '2rem',
        border: '1px solid #ccc',
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>🔑 Your Backup Codes:</h3>
        <ul id="backupList" style={{ listStyle: 'none', paddingLeft: 0 }}></ul>
        <button id="downloadBtn" onClick={downloadCodes} style={{ marginTop: '1rem' }}>
          📥 Download Backup Codes
        </button>
      </div>
    </div>
  );
}

export default Home;
