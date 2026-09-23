const passwordInput = document.getElementById("passwordInput");
const togglePassword = document.getElementById("togglePassword");
const strengthText = document.getElementById("strengthText");
const strengthFill = document.getElementById("strengthFill");

const lengthRequirement = document.getElementById("length");
const uppercaseRequirement = document.getElementById("uppercase");
const lowercaseRequirement = document.getElementById("lowercase");
const numberRequirement = document.getElementById("number");
const symbolRequirement = document.getElementById("symbol");

const crackTime = document.getElementById("crackTime");
const message = document.getElementById("message");
const copyButton = document.getElementById("copyButton");


const COMMON_PASSWORDS = [
  "password", "123456", "123456789", "qwerty", "abc123",
  "letmein", "monkey", "111111", "iloveyou", "admin",
  "welcome", "password1", "12345678"
];

passwordInput.addEventListener("input", analyzePassword);

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "🙈" : "👁";
});

function analyzePassword() {
  const password = passwordInput.value;

  if (password.length === 0) {
    resetAnalyzer();
    return;
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password)
  };

  updateRequirement(lengthRequirement, checks.length);
  updateRequirement(uppercaseRequirement, checks.uppercase);
  updateRequirement(lowercaseRequirement, checks.lowercase);
  updateRequirement(numberRequirement, checks.number);
  updateRequirement(symbolRequirement, checks.symbol);

  const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());
  const score = calculateScore(password, checks, isCommon);

  updateStrength(score, password, isCommon);
}


function calculateScore(password, checks, isCommon) {
  if (isCommon) return 0;

  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (checks.uppercase) score++;
  if (checks.lowercase) score++;
  if (checks.number) score++;
  if (checks.symbol) score++;

  
  if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1);

  return score;
}

function updateRequirement(element, passed) {
  element.textContent = element.textContent.replace(/[✅❌]/, passed ? "✅" : "❌");
  element.classList.toggle("valid", passed);
  element.classList.toggle("invalid", !passed);
}

function updateStrength(score, password, isCommon) {
  let label, width, msg;

  if (isCommon) {
    label = "Very Weak";
    width = "10%";
    msg = "This is one of the most commonly used passwords — avoid it entirely.";
  } else if (score <= 2) {
    label = "Weak";
    width = "25%";
    msg = "Needs improvement. Add more length and mix in different character types.";
  } else if (score <= 4) {
    label = "Medium";
    width = "50%";
    msg = "Getting better, but it could still be stronger.";
  } else if (score <= 6) {
    label = "Strong";
    width = "75%";
    msg = "Good password. A bit more length would make it even stronger.";
  } else {
    label = "Very Strong";
    width = "100%";
    msg = "Excellent! This password meets all the key security criteria.";
  }

  strengthText.textContent = label;
  strengthFill.style.width = width;
  message.textContent = msg;
  crackTime.textContent = `Estimated crack time: ${estimateCrackTime(password, isCommon)}`;
}


function estimateCrackTime(password, isCommon) {
  if (isCommon) return "Instantly";
  if (password.length === 0) return "—";

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;
  if (poolSize === 0) poolSize = 1;

  const combinations = Math.pow(poolSize, password.length);
  const guessesPerSecond = 1e10;
  const seconds = combinations / guessesPerSecond;

  return formatDuration(seconds);
}

function formatDuration(seconds) {
  const units = [
    { label: "centuries", secs: 60 * 60 * 24 * 365 * 100 },
    { label: "years", secs: 60 * 60 * 24 * 365 },
    { label: "months", secs: 60 * 60 * 24 * 30 },
    { label: "days", secs: 60 * 60 * 24 },
    { label: "hours", secs: 60 * 60 },
    { label: "minutes", secs: 60 },
    { label: "seconds", secs: 1 }
  ];

  for (const unit of units) {
    const value = seconds / unit.secs;
    if (value >= 1) {
      return `${value > 999 ? "999+" : Math.round(value)} ${unit.label}`;
    }
  }
  return "Instantly";
}

function resetAnalyzer() {
  strengthText.textContent = "—";
  strengthFill.style.width = "0%";
  crackTime.textContent = "Estimated crack time: —";
  message.textContent = "Enter a password to begin analysis.";

  [lengthRequirement, uppercaseRequirement, lowercaseRequirement, numberRequirement, symbolRequirement]
    .forEach((element) => {
      element.classList.remove("valid", "invalid");
    });
}

copyButton.addEventListener("click", async () => {
  const password = passwordInput.value;

  if (password === "") {
    message.textContent = "Please enter a password first.";
    return;
  }

  try {
    await navigator.clipboard.writeText(password);
    copyButton.textContent = "Copied! ✅";
  } catch (err) {
    copyButton.textContent = "Copy failed";
  }

  setTimeout(() => {
    copyButton.textContent = "Copy Password";
  }, 2000);
});