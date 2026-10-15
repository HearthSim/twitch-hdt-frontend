import { CardDefinition, CardHalves, Cards } from "./cards";

/**
 * Assemble: a minion is added to hand, then part of its card text is replaced
 * with the text of another card from a curated pool.
 *
 * Cards in that pool have their text split into two halves by an ampersand -
 * the trigger ("After your hero attacks,&") and the effect ("& Gain 3 Armor.").
 * An assembled minion keeps the half it contributes itself and names the card
 * donating the other half by dbfId (HDT sends CRAFTABLE_FIRST_HALF_DBID and
 * CRAFTABLE_SECOND_HALF_DBID as first_half and second_half).
 *
 * Ported from Joust's CardTextAssembler.
 */
export const HALF_DELIMITER = "&";

/**
 * The half tags are also set to 1 on the cards offered as parts, to mark which
 * half they would contribute; such a marker is not a card reference.
 */
const PART_MARKER = 1;

/**
 * Trailing gameplay metadata, e.g. "~GAMEPLAY ASPROXY BE 997".
 */
const TEXT_METADATA = /~.*$/;

/**
 * Strips the markers that only make sense on a single, unassembled card:
 * alternate text variants ("text@variant"), trailing gameplay metadata, the
 * "[x]" manual line break flag and non-breaking spaces.
 */
export function normalizeCardText(text?: string): string {
	if (!text) {
		return "";
	}
	return text
		.split("@")[0]
		.replace(TEXT_METADATA, "")
		.replace(/^\[x\]/, "")
		.replace(new RegExp(String.fromCharCode(160), "g"), " ")
		.trim();
}

export interface CardTextHalves {
	/** The trigger, before the delimiter. */
	first: string;
	/** The effect, after the delimiter. */
	second: string;
	/** Whether the text actually carries the delimiter. */
	delimited: boolean;
}

/**
 * Splits card text into the two halves assembly works with. Text without a
 * delimiter cannot be split, so either half is the whole text.
 */
export function splitCardHalves(text?: string): CardTextHalves {
	const normalized = normalizeCardText(text);
	const delimiter = normalized.indexOf(HALF_DELIMITER);
	if (delimiter === -1) {
		return { first: normalized, second: normalized, delimited: false };
	}
	return {
		first: normalized.substr(0, delimiter).trim(),
		second: normalized.substr(delimiter + 1).trim(),
		delimited: true,
	};
}

/**
 * Combines the first half of the card contributing it with the second half of
 * the card contributing that, falling back to the assembled card's own text for
 * whichever half it keeps.
 *
 * Returns null unless both source texts carry the delimiter: text from a build
 * that predates the mechanic has no halves to combine, and joining it whole
 * would describe a card that does not exist.
 */
export function assembleCardText(
	own?: CardDefinition | null,
	part1?: CardDefinition | null,
	part2?: CardDefinition | null,
): string | null {
	const from = splitCardHalves((part1 || own || ({} as CardDefinition)).text);
	const to = splitCardHalves((part2 || own || ({} as CardDefinition)).text);
	if (!from.delimited || !to.delimited) {
		return null;
	}
	const halves = [from.first, to.second].filter((half) => !!half);
	if (!halves.length) {
		return null;
	}
	return halves.join(" ");
}

/**
 * Returns the assembled card text for a minion, or null if it was not assembled
 * or its parts cannot be resolved - in which case the card should be shown as
 * printed.
 */
export function getAssembledCardText(
	halves: CardHalves | undefined,
	own: CardDefinition | null,
	cards: Cards,
): string | null {
	if (!halves) {
		return null;
	}
	const dbfIds = [halves.first, halves.second].map((value) =>
		// a marker says this card is offered as a part, it does not name one
		value && value > PART_MARKER ? value : 0,
	);
	if (!dbfIds.some((dbfId) => !!dbfId)) {
		// not an assembled minion
		return null;
	}
	if (!cards.loaded) {
		// metadata has not loaded yet
		return null;
	}
	const parts = dbfIds.map((dbfId) => (dbfId ? cards.getByDbfId(dbfId) : null));
	if (!parts.some((part) => !!part)) {
		// none of the parts are in the metadata for this build
		return null;
	}
	return assembleCardText(own, parts[0], parts[1]);
}

/**
 * Turns card text into the HTML shown on the card, as Joust does for cards
 * without an entity: stat placeholders keep their printed value, and newlines
 * are left to collapse because halves from two cards do not share a layout.
 */
export function formatCardText(text: string): string {
	let description = text
		.replace(TEXT_METADATA, "")
		.split(HALF_DELIMITER)
		.join("")
		.replace(/\$(\d+)/g, "$1")
		.replace(/#(\d+)/g, "$1")
		.replace(/^\[x\]/, "")
		.replace(new RegExp(String.fromCharCode(160), "g"), " ");

	// Pluralize (rule 4). Always picks the plural, as Joust does.
	while (description.indexOf("|4") >= 0) {
		const next = description.replace(/\|4\(([^,]*),([^)]*)\)/, "$2");
		if (next === description) {
			// Safeguard against badly-formatted text.
			break;
		}
		description = next;
	}

	return description.trim();
}
