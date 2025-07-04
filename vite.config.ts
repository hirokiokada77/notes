import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";
import * as cheerio from "cheerio";
import type { OutputAsset } from "rollup";
import { defineConfig, type ResolvedConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
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
				icons: [
					{
						src: "icon-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
		}),
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
		(() => {
			let config: ResolvedConfig;

			return {
				name: "inject-csp-and-sri",
				configResolved(resolvedConfig) {
					config = resolvedConfig;
				},
				writeBundle(options, bundle) {
					const scriptHashMap = new Map();
					const stylesheetHashMap = new Map();

					const htmls = Object.keys(bundle)
						.filter((fileName) => fileName.endsWith(".html"))
						.filter((fileName) => bundle[fileName].type === "asset")
						.map((fileName) => bundle[fileName]) as OutputAsset[];

					for (const html of htmls) {
						const $ = cheerio.load(html.source as string);

						const scripts = $("script[src]");
						const stylesheets = $("link[rel=stylesheet]");

						for (const script of scripts) {
							const resourcePath = resolve(
								options.dir ?? "",
								script.attribs.src.substring(config.base.length),
							);

							const source = readFileSync(resourcePath);

							const integrity = `sha384-${createHash("sha384")
								.update(source)
								.digest()
								.toString("base64")}`;

							script.attribs.integrity = integrity;

							scriptHashMap.set(script.attribs.src, integrity);
						}

						for (const stylesheet of stylesheets) {
							const resourcePath = resolve(
								options.dir ?? "",
								stylesheet.attribs.href.substring(config.base.length),
							);

							const source = readFileSync(resourcePath);

							const integrity = `sha384-${createHash("sha384")
								.update(source)
								.digest()
								.toString("base64")}`;

							stylesheet.attribs.integrity = integrity;

							stylesheetHashMap.set(stylesheet.attribs.href, integrity);
						}

						const cspElement = $(
							`<meta http-equiv="Content-Security-Policy" content="` +
								[
									["default-src", "'none'"],
									["img-src", "data: 'self'"],
									["manifest-src", "'self'"],
									["require-trusted-types-for", "'script'"],
									["trusted-types", "app-service-worker-policy"],
									[
										"script-src",
										Array.from(scriptHashMap.values())
											.map((hash) => `'${hash}'`)
											.concat("'strict-dynamic'")
											.join(" "),
									],
									[
										"style-src",
										Array.from(stylesheetHashMap.values())
											.map((hash) => `'${hash}'`)
											.join(" "),
									],
								]
									.map(([key, value]) => `${key} ${value}`)
									.join("; ") +
								`;">`,
						);

						$("head").append(cspElement);

						writeFileSync(resolve(options.dir ?? "", html.fileName), $.html());
					}
				},
			};
		})(),
	],
});
