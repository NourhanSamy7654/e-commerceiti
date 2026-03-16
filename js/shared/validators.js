export const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{2,29}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const EGYPT_MOBILE_REGEX = /^01[0125]\d{8}$/;

export const isValidEmail = (email = "") => {
  const normalizedEmail = email.trim().toLowerCase();
  return EMAIL_REGEX.test(normalizedEmail);
};

export const validateEgyptianPhone = (rawPhone = "") => {
  const phoneValue = rawPhone.trim();

  if (!phoneValue) {
    return {
      isValid: false,
      message: "Please enter your phone number.",
      normalizedPhone: "",
    };
  }

  if (!EGYPT_MOBILE_REGEX.test(phoneValue)) {
    return {
      isValid: false,
      message: "Phone must be Egyptian mobile: 010/011/012/015 + 8 digits.",
      normalizedPhone: "",
    };
  }

  return {
    isValid: true,
    message: "",
    normalizedPhone: phoneValue,
  };
};
