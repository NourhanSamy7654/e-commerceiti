import {
  getUsers,
  normalizeEmail,
  saveUsers,
  setCurrentUser,
} from "../shared/storage.js";
import {
  EMAIL_REGEX,
  STRONG_PASSWORD_REGEX,
  USERNAME_REGEX,
  validateEgyptianPhone,
} from "../shared/validators.js";

const form = document.querySelector("form.needs-validation");
const submitButton = document.querySelector(".register-submit-btn");
const successOverlay = document.getElementById("registerSuccessOverlay");
const passwordToggleButtons = document.querySelectorAll(".password-toggle");

const togglePasswordVisibility = (button) => {
  const targetId = button.getAttribute("data-target");
  const targetInput = targetId ? document.getElementById(targetId) : null;
  const icon = button.querySelector("i");

  if (!targetInput || !icon) {
    return;
  }

  const willShowPassword = targetInput.type === "password";
  targetInput.type = willShowPassword ? "text" : "password";
  icon.classList.toggle("bi-eye", !willShowPassword);
  icon.classList.toggle("bi-eye-slash", willShowPassword);
  button.setAttribute(
    "aria-label",
    willShowPassword ? "Hide password" : "Show password",
  );
};

const setSubmitButtonState = (state) => {
  if (!submitButton) {
    return;
  }

  submitButton.classList.remove("is-loading", "is-success");

  if (state === "loading") {
    submitButton.classList.add("is-loading");
  }

  if (state === "success") {
    submitButton.classList.add("is-success");
  }
};

const playSuccessAnimation = () => {
  if (!form) {
    return;
  }

  setSubmitButtonState("success");
  form.classList.add("register-form-success");

  Array.from(form.elements).forEach((element) => {
    element.disabled = true;
  });

  if (successOverlay) {
    successOverlay.classList.add("show");
    successOverlay.setAttribute("aria-hidden", "false");
  }
};

const blockSubmit = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

const setValidationMessage = (input, isValid, message, fallbackMessage) => {
  if (!input) {
    return false;
  }

  input.setCustomValidity(isValid ? "" : message);

  const feedbackElement =
    input.closest(".field-with-icon")?.querySelector(".invalid-feedback") ||
    (input.nextElementSibling?.classList?.contains("invalid-feedback")
      ? input.nextElementSibling
      : null);

  if (feedbackElement) {
    feedbackElement.textContent = input.validationMessage || fallbackMessage;
  }

  return isValid;
};

const validateUsername = () => {
  const usernameInput = form?.username;

  if (!usernameInput) {
    return false;
  }

  const username = usernameInput.value.trim();
  const isValid = USERNAME_REGEX.test(username);

  return setValidationMessage(
    usernameInput,
    isValid,
    "Username must start with a letter and be 3-30 characters (letters, numbers, underscore).",
    "Please enter a valid username.",
  );
};

const validateEmail = () => {
  const emailInput = form?.email;

  if (!emailInput) {
    return false;
  }

  const normalizedEmail = normalizeEmail(emailInput.value);
  const isValid = EMAIL_REGEX.test(normalizedEmail);

  return setValidationMessage(
    emailInput,
    isValid,
    "Please enter a valid email address.",
    "Please provide a valid email.",
  );
};

const validatePhone = () => {
  const phoneInput = form?.phone;

  if (!phoneInput) {
    return false;
  }

  const { isValid, message } = validateEgyptianPhone(phoneInput.value);

  return setValidationMessage(
    phoneInput,
    isValid,
    message,
    "Please provide a valid Egyptian mobile number.",
  );
};

const validatePassword = () => {
  const passwordInput = form?.password;

  if (!passwordInput) {
    return false;
  }

  const password = passwordInput.value;
  const isValid = STRONG_PASSWORD_REGEX.test(password);

  return setValidationMessage(
    passwordInput,
    isValid,
    "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
    "Please enter a stronger password.",
  );
};

const validatePasswordConfirmation = () => {
  const passwordInput = form?.password;
  const confirmInput = form?.passwordconfirm;

  if (!passwordInput || !confirmInput) {
    return false;
  }

  const passwordsMatch = Boolean(
    passwordInput.value &&
      confirmInput.value &&
      passwordInput.value === confirmInput.value,
  );

  return setValidationMessage(
    confirmInput,
    passwordsMatch,
    "Passwords do not match.",
    "Passwords must match.",
  );
};

const validateAllFields = () => {
  const usernameValid = validateUsername();
  const emailValid = validateEmail();
  const phoneValid = validatePhone();
  const passwordValid = validatePassword();
  const confirmPasswordValid = validatePasswordConfirmation();

  return (
    usernameValid &&
    emailValid &&
    phoneValid &&
    passwordValid &&
    confirmPasswordValid
  );
};

const handleRegisterSubmit = (event) => {
  if (!form) {
    return;
  }

  const areCustomValidationsPassing = validateAllFields();
  const isNativeFormValid = form.checkValidity();

  if (!areCustomValidationsPassing || !isNativeFormValid) {
    blockSubmit(event);
    form.classList.add("was-validated");
    setSubmitButtonState("idle");
    return;
  }

  blockSubmit(event);
  setSubmitButtonState("loading");

  const users = getUsers();
  const email = normalizeEmail(form.email.value);
  const { normalizedPhone } = validateEgyptianPhone(form.phone.value);

  if (users[email]) {
    setSubmitButtonState("idle");
    alert("An account with this email already exists. Please sign in.");
    window.location.href = "signin.html";
    return;
  }

  users[email] = {
    username: form.username.value.trim(),
    email,
    phone: normalizedPhone,
    password: form.password.value,
    createdAt: new Date().toISOString(),
  };

  saveUsers(users);
  setCurrentUser(email);
  playSuccessAnimation();

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1700);
};

const bindLiveValidation = () => {
  if (!form) {
    return;
  }

  form.username?.addEventListener("input", validateUsername);
  form.email?.addEventListener("input", validateEmail);
  form.phone?.addEventListener("input", validatePhone);

  form.password?.addEventListener("input", () => {
    validatePassword();
    validatePasswordConfirmation();
  });

  form.passwordconfirm?.addEventListener("input", validatePasswordConfirmation);
};

if (form) {
  form.addEventListener("submit", handleRegisterSubmit);
  bindLiveValidation();
}

passwordToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    togglePasswordVisibility(button);
  });
});
