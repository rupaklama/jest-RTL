import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";
import { Provider } from "react-redux";
import createStore from "../state/store";

// note - store setup

// redux state wrapper
const RootWrapper = ({ children }) => {
  return (
    <Router>
      <Provider store={createStore()}>
        {children}
        <LanguageSelector />
      </Provider>
    </Router>
  );
};

const customRender = (ui, options) => render(ui, { wrapper: RootWrapper, ...options });

// re-export everything
export * from "@testing-library/react";

// override default rtl render method with our custom wrapper render above
export { customRender as render };
