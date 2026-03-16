const STORAGE_KEYS = Object.freeze({
  USERS: "users",
  CURRENT_USER: "currentUser",
});

const parseJSON = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const getUsers = () => {
  const parsedUsers = parseJSON(localStorage.getItem(STORAGE_KEYS.USERS), {});
  return parsedUsers && typeof parsedUsers === "object" ? parsedUsers : {};
};

export const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const setCurrentUser = (email) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, normalizeEmail(email));
};

export const getCurrentUserEmail = () =>
  normalizeEmail(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || "");

export const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = () => {
  const email = getCurrentUserEmail();

  if (!email) {
    return null;
  }

  const users = getUsers();
  const user = users[email];

  if (!user) {
    return null;
  }

  return { ...user, email };
};

export const deleteUserByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return false;
  }

  const users = getUsers();

  if (!users[normalizedEmail]) {
    return false;
  }

  delete users[normalizedEmail];
  saveUsers(users);
  return true;
};

export const deleteCurrentUserAccount = () => {
  const email = getCurrentUserEmail();

  if (!email) {
    return false;
  }

  const wasDeleted = deleteUserByEmail(email);
  clearCurrentUser();
  return wasDeleted;
};

export const updateCurrentUserProfile = (updates = {}) => {
  const currentEmail = getCurrentUserEmail();

  if (!currentEmail) {
    return { ok: false, reason: "not_signed_in" };
  }

  const users = getUsers();
  const currentUser = users[currentEmail];

  if (!currentUser) {
    return { ok: false, reason: "user_not_found" };
  }

  const nextEmail = normalizeEmail(updates.email ?? currentEmail);

  if (!nextEmail) {
    return { ok: false, reason: "invalid_email" };
  }

  if (nextEmail !== currentEmail && users[nextEmail]) {
    return { ok: false, reason: "email_exists" };
  }

  const updatedUser = {
    ...currentUser,
    ...updates,
    email: nextEmail,
  };

  if (!updatedUser.profileImage) {
    delete updatedUser.profileImage;
  }

  if (nextEmail !== currentEmail) {
    delete users[currentEmail];
    setCurrentUser(nextEmail);
  }

  users[nextEmail] = updatedUser;
  saveUsers(users);

  return { ok: true, user: { ...updatedUser, email: nextEmail } };
};