// utils/tokenUtils.js
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() >= expiry;
  } catch (error) {
    return true;
  }
};

export const getTokenExpiry = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const getTokenRemainingTime = (token) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return 0;
  return expiry.getTime() - Date.now();
};