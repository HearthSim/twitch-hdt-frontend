export const enum DecklistPosition {
	TOP_LEFT = "topleft",
	TOP_RIGHT = "topright",
}

export const enum Feature {
	DECKLIST = 1,
	// B = 2,
	// C = 4,
	// D = 8,
}

export const setFeature = (
	mask: number,
	feature: Feature,
	set = true,
): number => {
	return set ? mask | feature : mask & ~feature;
};

export const hasFeature = (mask: number, feature: Feature): boolean => {
	return (mask & feature) === 1;
};
