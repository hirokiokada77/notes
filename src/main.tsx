import "./index.css";
import { enableMapSet } from "immer";
import { Provider } from "jotai";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { store } from "./atoms";

enableMapSet();

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLDivElement,
);
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>,
);
