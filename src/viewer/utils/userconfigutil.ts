import Cookies from "js-cookie";

type ViewerConfigOptions =
	| "bobs_buddy-enabled"
	| "bobs_buddy-show_during_combat"
	| "bobs_buddy-show_during_shopping";

export function getViewerConfig(
	toGet: ViewerConfigOptions,
	defaultValue?: string,
): boolean {
	return (Cookies.get(toGet) || defaultValue) === "1";
}

export function setViewerConfig(toSet: ViewerConfigOptions, value: boolean) {
	Cookies.set(toSet, value ? "1" : "0", { expires: 365 });
}
