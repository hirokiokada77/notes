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
				name: "inject-sri",
				configResolved(resolvedConfig) {
					config = resolvedConfig;
				},
				writeBundle(options, bundle) {
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
						}

						writeFileSync(resolve(options.dir ?? "", html.fileName), $.html());
					}
				},
			};
		})(),
		{
			name: "insert-csp",
			transformIndexHtml(html) {
				if (process.env.NODE_ENV === "production") {
					const $ = cheerio.load(html);

					const cspElement = $(
						`<meta http-equiv="Content-Security-Policy" content="` +
							[
								["default-src", ["'none'"]],
								["font-src", ["'self'", "data:"]],
								["img-src", ["'self'", "data:"]],
								["manifest-src", ["'self'"]],
								["script-src-elem", ["'self'"]],
								["style-src-attr", ["'unsafe-inline'"]],
								["style-src-elem", ["'self'"]],
								["worker-src", ["'self'"]],
							]
								.map(
									([key, values]) => `${key} ${(values as string[]).join(" ")}`,
								)
								.join("; ") +
							`;">`,
					);

					$("head").append(cspElement);

					return $.html();
				}
			},
		},
	],
});
