export function getUser(){ try { return JSON.parse(localStorage.getItem("sm_user")||"null"); } catch { return null; } }
export function logout(){ localStorage.removeItem("sm_user"); window.location.href = "/"; }
