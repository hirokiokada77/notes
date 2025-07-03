if ("serviceWorker" in navigator) {
	let serviceWorkerUrl = "/notes/sw.js";

	if (window.trustedTypes?.createPolicy) {
		const serviceWorkerPolicy = window.trustedTypes.createPolicy(
			"app-service-worker-policy",
			{
				createScriptURL: (url: string) => {
					if (url === "/notes/sw.js") {
						return url;
					}

					throw new Error(`Untrusted URL for Service Worker: ${url}`);
				},
			},
		);

		serviceWorkerUrl = serviceWorkerPolicy.createScriptURL(
			serviceWorkerUrl,
		) as unknown as string;
	}

	window.addEventListener("load", () => {
		navigator.serviceWorker.register(serviceWorkerUrl, { scope: "/notes/" });
	});
}
