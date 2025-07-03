import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { LocaleProvider } from "./contexts/LocaleProvider";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { ToastProvider } from "./contexts/ToastProvider";
import "./registerSW.ts";

// biome-ignore lint/style/noNonNullAssertion: #root is never null
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
	<React.StrictMode>
		<LocaleProvider>
			<ToastProvider>
				<ThemeProvider>
					<App />
				</ThemeProvider>
			</ToastProvider>
		</LocaleProvider>
	</React.StrictMode>,
);
