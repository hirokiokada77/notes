import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toast } from "./components/Toast";
import { homePath, savedNotesPath } from "./constants";
import { useInit } from "./hooks";
import { Home } from "./pages/Home";
import { SavedNotes } from "./pages/SavedNotes";

export const App = () => {
	useInit();

	return (
		<BrowserRouter>
			<Routes>
				<Route path={homePath} element={<Home />} />
				<Route path={savedNotesPath} element={<SavedNotes />} />
				<Route path="*" element={<Navigate to={homePath} replace />} />
			</Routes>

			<Toast />
		</BrowserRouter>
	);
};
