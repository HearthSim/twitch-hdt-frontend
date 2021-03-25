import { encode } from "deckstrings";
import { BoardStateDeckCard, FormatType } from "../twitch-hdt";

export const getCopiableDeck = (
	cardList: BoardStateDeckCard[],
	format: FormatType,
	heroes: number[],
	name?: string,
): string => {
	const initialCards: [number, number][] = cardList
		.filter((card: BoardStateDeckCard) => {
			const [dbfId, current, initial] = card;
			return !!initial;
		})
		.map<[number, number]>((card: BoardStateDeckCard) => {
			const [dbfId, current, initial] = card;
			return [dbfId, initial];
		})
		.reduce<[number, number][]>(
			(result: [number, number][], card: [number, number]) => {
				result = result.slice(0);
				for (let i = 0; i < result.length; i++) {
					if (result[i][0] === card[0]) {
						result[i][1] += card[1];
						return result;
					}
				}
				// new card, append
				return result.concat([card]);
			},
			[],
		);
	const deckDescription = {
		cards: initialCards,
		format,
		heroes,
	};

	let deckstring = null;
	try {
		deckstring = encode(deckDescription);
	} catch (e) {
		console.error(e);
		return "";
	}

	if (deckstring === null) {
		return "";
	}

	const isStandard = format === FormatType.FT_STANDARD;
	const isClassic = format === FormatType.FT_CLASSIC;

	return [
		...(name ? [`### ${name}`] : []),
		...(format
			? [
					`# Format: ${
						isStandard ? "Standard" : isClassic ? "Classic" : "Wild"
					}`,
			  ]
			: []),
		"#",
		deckstring,
		"#",
		"# To use this deck, copy it to your clipboard and create a new deck in Hearthstone",
	].join("\n");
};
