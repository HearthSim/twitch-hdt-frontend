import * as clipboard from "clipboard-polyfill";

export const copyText = async (data: string): Promise<void> => {
	// Work around clipboard-write missing from the sandbox attribute in Chrome
	try {
		// First, check if the browser recognizes the policy, and if it's denied
		const result = await navigator.permissions.query({
			name: "clipboard-write" as PermissionName,
		});
		if (result.state === "denied") {
			// At this point we're probably sandboxed - let's at least try the
			// old browser API
			let called = false;
			const listener = (e: ClipboardEvent) => {
				const clipboardData = e.clipboardData;
				if (clipboardData) {
					clipboardData.setData("text/plain", data);
					called = true;
					e.preventDefault();
				}
			};
			document.addEventListener("copy", listener);
			try {
				document.execCommand("copy");
			} finally {
				document.removeEventListener("copy", listener);
			}
			if (called) {
				return;
			}
		}
		// otherwise the permission is likely granted, let's proceed with the
		// regular polyfill
	} catch {
		// the fallback failed, let's proceed with the regular polyfill
	}
	await clipboard.writeText(data);
};
