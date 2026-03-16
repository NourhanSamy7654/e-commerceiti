import { getUsers, normalizeEmail, setCurrentUser } from "../shared/storage.js";
import { isValidEmail } from "../shared/validators.js";

const form = document.querySelector("form.needs-validation");
const alertBox = document.getElementById("signinAlert");

const blockSubmit = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

const showAlert = (type, message) => {
  if (!alertBox) {
    return;
  }

  alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
};

const validateEmailField = () => {
  const emailInput = form?.email;

  if (!emailInput) {
    return false;
  }

  const isEmailValid = isValidEmail(emailInput.value);

  emailInput.setCustomValidity(
    isEmailValid ? "" : "Please enter a valid email address.",
  );

  if (emailInput.nextElementSibling) {
    emailInput.nextElementSibling.textContent =
      emailInput.validationMessage || "Please enter a valid email.";
  }

  return isEmailValid;
};

const handleSignInSubmit = (event) => {
  if (!form) {
    return;
  }

  const isEmailValid = validateEmailField();
  const isNativeFormValid = form.checkValidity();

  if (!isNativeFormValid || !isEmailValid) {
    blockSubmit(event);
    form.classList.add("was-validated");
    return;
  }

  blockSubmit(event);

  const users = getUsers();
  const email = normalizeEmail(form.email.value);
  const password = form.password.value;

  if (!users[email]) {
    showAlert("danger", "No account found for this email. Please register first.");
    form.classList.add("was-validated");
    return;
  }

  if (users[email].password !== password) {
    showAlert("danger", "Incorrect password. Please try again.");
    form.classList.add("was-validated");
    return;
  }

  showAlert("success", "Signed in successfully! Redirecting...");
  setCurrentUser(email);
  form.classList.add("was-validated");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 900);
};

if (form) {
  form.addEventListener("submit", handleSignInSubmit);
  form.email?.addEventListener("input", validateEmailField);
}
