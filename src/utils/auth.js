const TokenKey = 'Admin-Token';
const RefreshKey = 'Refresh-Token';

export function getToken() {
  return localStorage.getItem(TokenKey);
}

export function setToken(tokenValue) {
  return localStorage.setItem(TokenKey, tokenValue || '');
}

export function removeToken() {
  return localStorage.removeItem(TokenKey);
}

export function setRefreshToken(token) {
  return localStorage.setItem(RefreshKey, token || '');
}

export function getRefreshToken() {
  return localStorage.getItem(RefreshKey);
}

export function removeRefreshToken() {
  return localStorage.removeItem(RefreshKey);
}

export function clearToken() {
  removeToken();
  removeRefreshToken();
}