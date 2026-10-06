import { DeckDefinition, encode } from "deckstrings";
import {
	BnetGameType,
	BoardStateDeckCard,
	CardReference,
	FormatType,
	SideboardDeckCard,
} from "../twitch-hdt";
import { Cards, resolveCard } from "./cards";

const toDbfId = (cards: Cards, identifier: CardReference): number | null =>
	typeof identifier === "number"
		? identifier
		: resolveCard(cards, identifier).card?.dbfId ?? null;

export interface DeckToCopy {
	text: string;
	missingCards: number;
}

export const getDeckToCopy = (
	cards: Cards,
	cardList: BoardStateDeckCard[],
	sideboards: SideboardDeckCard[],
	format: FormatType,
	heroes: CardReference[],
	name?: string,
): DeckToCopy | null => {
	if (format === FormatType.FT_UNKNOWN) {
		return null;
	}

	const heroDbfIds = heroes.map((hero) => toDbfId(cards, hero));
	if (heroDbfIds.some((dbfId) => dbfId === null)) {
		return null;
	}

	const resolvedCards = cardList
		.filter((card: BoardStateDeckCard) => {
			return !!card[2];
		})
		.map<[number | null, number]>((card: BoardStateDeckCard) => {
			const [cardId, current, initial] = card;
			return [toDbfId(cards, cardId), initial];
		});

	const missingCards = resolvedCards
		.filter(([dbfId]) => dbfId === null)
		.reduce((total, [dbfId, count]) => total + count, 0);

	const initialCards: DeckDefinition["cards"] = resolvedCards
		.filter((card): card is [number, number] => card[0] !== null)
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
		.map<[number | null, number, number | null]>((card: SideboardDeckCard) => {
			const [owner, cardId, current, initial] = card;
			return [toDbfId(cards, cardId), initial, toDbfId(cards, owner)];
		})
		.filter(
			(card): card is [number, number, number] =>
				card[0] !== null && card[2] !== null,
		)
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
		heroes: heroDbfIds as number[],
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

	const text = [
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

	return { text, missingCards };
};

export const isBattlegroundsGameType = (
	gameType: number | undefined,
): boolean => {
	return (
		[
			BnetGameType.BGT_BATTLEGROUNDS,
			BnetGameType.BGT_BATTLEGROUNDS_FRIENDLY,
			BnetGameType.BGT_BATTLEGROUNDS_PLAYER_VS_AI,
			BnetGameType.BGT_BATTLEGROUNDS_DUO,
			BnetGameType.BGT_BATTLEGROUNDS_DUO_VS_AI,
			BnetGameType.BGT_BATTLEGROUNDS_DUO_FRIENDLY,
		].indexOf(gameType || 0) !== -1
	);
};
