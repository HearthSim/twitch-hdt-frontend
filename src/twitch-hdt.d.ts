export type Message = BaseMessage | BoardStateMessage | GameEndMessage;

interface BaseMessage {
	type: string;
	config: EBSConfiguration;
	version: "1.0" | number;
}

interface EBSConfiguration {
	deck_position?: string;
	hidden?: string;
	game_offset_horizontal?: string;
}

export interface BoardStateMessage extends BaseMessage {
	type: "board_state";
	data: BoardStateData;
}

export interface BoardStateData {
	/**
	 * Describes the friendly side in the bottom half of the screen.
	 */
	player?: BoardStatePlayer;

	/**
	 * Describes the opposing side in the top half of the screen.
	 */
	opponent?: BoardStatePlayer;
}

export interface BoardStatePlayer {
	deck?: BoardStateDeck;
	hand?: BoardStateHand;

	/**
	 * The dbfIds of minions on the board.
	 */
	board?: number[];

	/**
	 * The dbfId of the hero.
	 */
	hero?: number;

	/**
	 * The dbfId of the hero power.
	 */
	hero_power?: number;

	/**
	 * The dbfId of the weapon, if any.
	 */
	weapon?: number;

	/**
	 * The dbfIds of secrets.
	 */
	secrets?: number[];

	/**
	 * An object describing the active quest, if any.
	 */
	quest?: BoardStateQuest;

	/**
	 * The amount of damage that was taken with the last fatigue draw (corresponds to GameTag.FATIGUE).
	 */
	fatigue?: number;
}

export interface BoardStateQuest {
	/**
	 * The dbfId of the active quest.
	 */
	dbfId: number;

	/**
	 * The progress of the active quest (corresponds to GameTag.QUEST_PROGRESS).
	 */
	progress: number;

	/**
	 * The total required progress of the active quest (corresponds to GameTag.QUEST_PROGRESS_TOTAL).
	 */
	total: number;
}

export interface BoardStateHand {
	cards?: number[];
	size: number;
}

export type BoardStateDeckCard = [number, number, number];

export interface BoardStateDeck {
	cards?: BoardStateDeckCard[]; // [dbfId, current, initial]
	name?: string;
	hero?: number;
	format?: FormatType;
	wins?: number;
	losses?: number;
	size: number;
}

export const enum FormatType {
	FT_WILD = 1,
	FT_STANDARD = 2,
}

export interface GameEndMessage extends BaseMessage {
	type: "game_end";
	data: null;
}
