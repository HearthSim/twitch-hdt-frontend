import { DeckDefinition, encode } from "deckstrings";
import {
	BnetGameType,
	BoardStateDeckCard,
	FormatType,
	SideboardDeckCard,
} from "../twitch-hdt";

export const getDeckToCopy = (
	cardList: BoardStateDeckCard[],
	sideboards: SideboardDeckCard[],
	format: FormatType,
	heroes: number[],
	name?: string,
): string | null => {
	if (format === FormatType.FT_UNKNOWN) {
		return null;
	}

	const initialCards: DeckDefinition["cards"] = cardList
		.filter((card: BoardStateDeckCard) => {
			return !!card[2];
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

	const sideboardCards: DeckDefinition["sideboardCards"] = sideboards
		.filter((card: SideboardDeckCard) => {
			return !!card[3];
		})
		.map<[number, number, number]>((card: SideboardDeckCard) => {
			const [owner, dbfId, current, initial] = card;
			return [dbfId, initial, owner];
		})
		.reduce<[number, number, number][]>(
			(result: [number, number, number][], card: [number, number, number]) => {
				result = result.slice(0);
				for (let i = 0; i < result.length; i++) {
					if (result[i][0] === card[0] && result[i][2] === card[2]) {
						result[i][1] += card[1];
						return result;
					}
				}
				// new card, append
				return result.concat([card]);
			},
			[],
		);

	const deckDefinition: DeckDefinition = {
		cards: initialCards,
		sideboardCards,
		format,
		heroes,
	};

	let deckstring = null;
	try {
		deckstring = encode(deckDefinition);
	} catch (e) {
		console.error(e);
		return null;
	}

	if (deckstring === null) {
		return null;
	}

	const isStandard = format === FormatType.FT_STANDARD;
	const isClassic = format === FormatType.FT_CLASSIC;
	const isTwist = format === FormatType.FT_TWIST;

	return [
		...(name ? [`### ${name}`] : []),
		...(format
			? [
					`# Format: ${
						isStandard
							? "Standard"
							: isTwist
							? "Twist"
							: isClassic
							? "Classic"
							: "Wild"
					}`,
			  ]
			: []),
		"#",
		deckstring,
		"#",
		"# To use this deck, copy it to your clipboard and create a new deck in Hearthstone",
	].join("\n");
};

export const isBattlegroundsGameType = (
	gameType: number | undefined,
): boolean => {
	return (
		[
			BnetGameType.BGT_BATTLEGROUNDS,
			BnetGameType.BGT_BATTLEGROUNDS_FRIENDLY,
			BnetGameType.BGT_BATTLEGROUNDS_DUO,
			BnetGameType.BGT_BATTLEGROUNDS_DUO_VS_AI,
			BnetGameType.BGT_BATTLEGROUNDS_DUO_FRIENDLY,
		].indexOf(gameType || 0) !== -1
	);
};
