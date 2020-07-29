export const enum OverlayPosition {
	TOP_LEFT = "topleft",
	TOP_CENTER = "topcenter",
	TOP_RIGHT = "topright",
}

export const enum WhenToShowBobsBuddy {
	All = "all",
	OnlyInShopping = "onlyinshopping",
	OnlyInCombat = "onlyincombat",
}

export const enum Feature {
	DECKLIST = 1 << 0,
	TOOLTIPS = 1 << 1,
	BOBSBUDDY = 1 << 2,
}

export const setFeature = (
	mask: number,
	feature: Feature,
	set = true,
): number => {
	return set ? mask | feature : mask & ~feature;
};

export const hasFeature = (mask: number, feature: Feature): boolean => {
	return (mask & feature) === feature;
};
