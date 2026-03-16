import {
  clearCurrentUser,
  deleteCurrentUserAccount,
  getCurrentUser,
  normalizeEmail,
  updateCurrentUserProfile,
} from "../shared/storage.js";
import {
  EMAIL_REGEX,
  USERNAME_REGEX,
  validateEgyptianPhone,
} from "../shared/validators.js";

const form = document.getElementById("accountForm");
const usernameInput = document.getElementById("accountUsername");
const emailInput = document.getElementById("accountEmail");
const phoneInput = document.getElementById("accountPhone");
const profileImageInput = document.getElementById("profileImageInput");
const removeImageBtn = document.getElementById("removeImageBtn");
const profilePreview = document.getElementById("profilePreview");
const profileFallback = document.getElementById("profileFallback");
const saveChangesBtn = document.getElementById("saveChangesBtn");
const alertBox = document.getElementById("accountAlert");
const signOutBtn = document.getElementById("signOutBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

let currentUser = getCurrentUser();
let profileImageData = currentUser?.profileImage || "";

const redirectToSignIn = () => {
  window.location.href = "signin.html";
};

if (!currentUser) {
  redirectToSignIn();
}

const showAlert = (type, message) => {
  if (!alertBox) {
    return;
  }

  alertBox.innerHTML = `<div class="alert alert-${type} mb-0" role="alert">${message}</div>`;
};

const setActionButtonsDisabled = (isDisabled) => {
  if (saveChangesBtn) {
    saveChangesBtn.disabled = isDisabled;
  }

  if (signOutBtn) {
    signOutBtn.disabled = isDisabled;
  }

  if (deleteAccountBtn) {
    deleteAccountBtn.disabled = isDisabled;
  }
};

const setFieldValidity = (input, isValid, message) => {
  if (!input) {
    return;
  }

  input.setCustomValidity(isValid ? "" : message);
};

const getFallbackChar = () => {
  const source =
    usernameInput?.value.trim() ||
    currentUser?.username ||
    currentUser?.email ||
    "User";

  return source.charAt(0).toUpperCase();
};

const renderProfilePhoto = () => {
  if (!profilePreview || !profileFallback) {
    return;
  }

  if (profileImageData) {
    profilePreview.src = profileImageData;
    profilePreview.hidden = false;
    profileFallback.hidden = true;
    return;
  }

  profilePreview.hidden = true;
  profilePreview.removeAttribute("src");
  profileFallback.hidden = false;
  profileFallback.textContent = getFallbackChar();
};

const fillForm = () => {
  if (!currentUser) {
    return;
  }

  if (usernameInput) {
    usernameInput.value = currentUser.username || "";
  }

  if (emailInput) {
    emailInput.value = currentUser.email || "";
  }

  if (phoneInput) {
    phoneInput.value = currentUser.phone || "";
  }

  renderProfilePhoto();
};

const validateAccountForm = () => {
  const username = usernameInput?.value.trim() || "";
  const email = normalizeEmail(emailInput?.value || "");
  const phoneValidation = validateEgyptianPhone(phoneInput?.value || "");

  const isUsernameValid = USERNAME_REGEX.test(username);
  const isEmailValid = EMAIL_REGEX.test(email);
  const isPhoneValid = phoneValidation.isValid;

  setFieldValidity(
    usernameInput,
    isUsernameValid,
    "Username must start with a letter and be 3-30 characters.",
  );

  setFieldValidity(emailInput, isEmailValid, "Please enter a valid email.");

  setFieldValidity(
    phoneInput,
    isPhoneValid,
    phoneValidation.message ||
      "Phone must be Egyptian mobile: 010/011/012/015 + 8 digits.",
  );

  return {
    isValid: isUsernameValid && isEmailValid && isPhoneValid,
    data: {
      username,
      email,
      phone: phoneValidation.normalizedPhone,
    },
  };
};

const onProfileImageSelected = () => {
  const file = profileImageInput?.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showAlert("danger", "Please select a valid image file.");
    profileImageInput.value = "";
    return;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    showAlert("danger", "Image is too large. Please choose an image under 2MB.");
    profileImageInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    profileImageData = String(reader.result || "");
    renderProfilePhoto();
    showAlert("info", "Photo selected. Click Save changes to apply.");
  };

  reader.onerror = () => {
    showAlert("danger", "Could not read this image. Please try another one.");
  };

  reader.readAsDataURL(file);
};

const onRemovePhoto = () => {
  profileImageData = "";

  if (profileImageInput) {
    profileImageInput.value = "";
  }

  renderProfilePhoto();
  showAlert("info", "Photo removed. Click Save changes to apply.");
};

const onSaveChanges = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const validationResult = validateAccountForm();

  if (!form || !validationResult.isValid || !form.checkValidity()) {
    form?.classList.add("was-validated");
    return;
  }

  setActionButtonsDisabled(true);

  const result = updateCurrentUserProfile({
    username: validationResult.data.username,
    email: validationResult.data.email,
    phone: validationResult.data.phone,
    profileImage: profileImageData,
    updatedAt: new Date().toISOString(),
  });

  setActionButtonsDisabled(false);

  if (!result.ok) {
    if (result.reason === "email_exists") {
      setFieldValidity(emailInput, false, "This email is already used by another account.");
      form?.classList.add("was-validated");
      showAlert("danger", "This email is already used by another account.");
      return;
    }

    if (result.reason === "not_signed_in" || result.reason === "user_not_found") {
      showAlert("warning", "Session expired. Please sign in again.");
      setTimeout(() => {
        redirectToSignIn();
      }, 900);
      return;
    }

    showAlert("danger", "Could not save your changes. Please try again.");
    return;
  }

  currentUser = result.user;
  profileImageData = currentUser.profileImage || "";
  fillForm();
  form?.classList.add("was-validated");
  showAlert("success", "Your account data was updated successfully.");
};

if (form) {
  form.addEventListener("submit", onSaveChanges);
}

if (usernameInput) {
  usernameInput.addEventListener("input", () => {
    setFieldValidity(
      usernameInput,
      USERNAME_REGEX.test(usernameInput.value.trim()),
      "Username must start with a letter and be 3-30 characters.",
    );

    renderProfilePhoto();
  });
}

if (emailInput) {
  emailInput.addEventListener("input", () => {
    setFieldValidity(
      emailInput,
      EMAIL_REGEX.test(normalizeEmail(emailInput.value)),
      "Please enter a valid email.",
    );
  });
}

if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    const validation = validateEgyptianPhone(phoneInput.value);
    setFieldValidity(
      phoneInput,
      validation.isValid,
      validation.message ||
        "Phone must be Egyptian mobile: 010/011/012/015 + 8 digits.",
    );
  });
}

if (profileImageInput) {
  profileImageInput.addEventListener("change", onProfileImageSelected);
}

if (removeImageBtn) {
  removeImageBtn.addEventListener("click", onRemovePhoto);
}

if (signOutBtn) {
  signOutBtn.addEventListener("click", () => {
    setActionButtonsDisabled(true);
    clearCurrentUser();
    showAlert("success", "Signed out successfully. Redirecting to sign in...");

    setTimeout(() => {
      redirectToSignIn();
    }, 700);
  });
}

if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener("click", () => {
    const firstConfirm = window.confirm(
      "Are you sure you want to delete your account permanently?",
    );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm = window.confirm(
      "This action cannot be undone. Delete account now?",
    );

    if (!secondConfirm) {
      return;
    }

    setActionButtonsDisabled(true);
    const wasDeleted = deleteCurrentUserAccount();

    if (!wasDeleted) {
      showAlert(
        "warning",
        "Account data was not found, but you were signed out safely.",
      );

      setTimeout(() => {
        redirectToSignIn();
      }, 900);

      return;
    }

    showAlert("success", "Account deleted successfully. Redirecting...");

    setTimeout(() => {
      window.location.href = "register.html";
    }, 900);
  });
}

fillForm();