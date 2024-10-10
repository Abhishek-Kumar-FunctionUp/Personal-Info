import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store"; 
import PersonalInfoTable from "./PersonalInfoTable";

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <PersonalInfoTable />
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
