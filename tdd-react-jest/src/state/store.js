import { createStore } from "redux";
import authReducer from "./authReducer";
import storage from "./storage";

export let store;

const createAppStore = () => {
  // setting user initial state from localStorage if exists
  const initialState = storage.getItem("auth") || {
    isLoggedIn: false,
    id: "",
  };

  store = createStore(
    authReducer,
    initialState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  // this method gets call whenever the store updates
  store.subscribe(() => {
    // saving the user state from redux store to local storage to persist data
    // localStorage.setItem("auth", JSON.stringify(store.getState()));
    storage.setItem("auth", store.getState());
  });

  return store;
};

export default createAppStore;
