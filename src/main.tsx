import "./index.css";
import { Provider } from "jotai";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { store } from "./atoms";

// biome-ignore lint/style/noNonNullAssertion: #root is never null
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>,
);
