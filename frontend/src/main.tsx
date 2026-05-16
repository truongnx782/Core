import ReactDOM from "react-dom/client";
import "./i18n/i18n";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
