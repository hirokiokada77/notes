import process from "node:process";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import sri from "vite-plugin-sri";
import { app_description, app_name } from "./src/locales/en.json";

export default defineConfig({
	base: "/notes/",
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: null,
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,json}"],
			},
			manifest: {
				name: app_name,
				short_name: app_name,
				description: app_description,
				theme_color: "#ffffff",
			},
		}),
		sri(),
		{
			name: "inject-app-name",
			transformIndexHtml(html) {
				return html.replace("__app_name__", app_name);
			},
		},
		{
			name: "inject-app-description",
			transformIndexHtml(html) {
				return html.replace("__app_description__", app_description);
			},
		},
		{
			name: "inject-csp",
			transformIndexHtml(html) {
				return html.replace(
					"__csp__",
					process.env.NODE_ENV === "production"
						? `<meta http-equiv="Content-Security-Policy" content="` +
								[
									["default-src", "'none'"],
									["manifest-src", "'self'"],
									["require-trusted-types-for", "'script'"],
									["trusted-types", "app-service-worker-policy"],
									["script-src", "'self'"],
									["style-src", "'self'"],
								]
									.map(([key, value]) => `${key} ${value}`)
									.join("; ") +
								`;">`
						: "",
				);
			},
		},
	],
});
