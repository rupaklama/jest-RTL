import SecureLS from "secure-ls";

// Secure localStorage data with high level of encryption and data compression for security
const secureLS = new SecureLS();

const setItem = (key, value) => {
  // localStorage.setItem(key, JSON.stringify(value))
  // note - no need to stringify/parse with secureLS
  secureLS.set(key, value);
};

const getItem = key => {
  return secureLS.get(key);
};

const clear = () => {
  localStorage.clear();
};

const storage = {
  setItem,
  getItem,
  clear,
};

export default storage;
