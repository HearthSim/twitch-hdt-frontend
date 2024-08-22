export type Message = BaseMessage | BoardStateMessage | GameEndMessage;

interface BaseMessage {
	type: string;
	config: EBSConfiguration;
	version: "1.0" | number;
}

interface EBSConfiguration {
	deck_position?: string;
	when_to_show_bobs_buddy?: string;
	hidden?: string;
	game_offset_horizontal?: string;
	promote_on_hsreplaynet?: boolean;
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

	/**
	 * The dbfId of the Battleground anomaly.
	 */
	battlegrounds_anomaly?: number;

	/**
	 * Contains the game type of the current game.
	 */
	game_type?: BnetGameType;

	/**
	 * Contains the results of the last Bob's Buddy simulation.
	 */
	bobs_buddy_state?: BobsBuddyState;
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
	 * The dbfId of the first trinket, if any.
	 */
	first_trinket?: number;

	/**
	 * The dbfId of the second trinket, if any.
	 */
	second_trinket?: number;

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

export interface BobsBuddyState {
	/**
	 * The player's likelihood to deal lethal damage to their opponent.
	 */
	player_lethal_rate: number;

	/**
	 * The player's likelihood to win the combat round.
	 */
	win_rate: number;

	/**
	 * The likelihood for the combat round to tie.
	 */
	tie_rate: number;

	/**
	 * The player's likelihood to lose the combat round.
	 */
	loss_rate: number;

	/**
	 * The player's likelihood to be killed by their opponent.
	 */
	opponent_lethal_rate: number;

	/**
	 * The state of the player's Bob's Buddy instance (corresponds to BobsBuddyState.TwitchSimulationState)/
	 */
	simulation_state: SimulationState;
}

export interface BoardStateHand {
	cards?: number[];
	size: number;
}

export type BoardStateDeckCard = [
	/**
	 * dbf id
	 */
	number,
	/**
	 * current count
	 */
	number,
	/**
	 * initial count
	 */
	number,
];

export type SideboardDeckCard = [
	/**
	 * owner dbf id
	 */
	number,
	/**
	 * dbf id
	 */
	number,
	/**
	 * current count
	 */
	number,
	/**
	 * initial count
	 */
	number,
];

export interface BoardStateDeck {
	cards?: BoardStateDeckCard[];
	sideboards?: SideboardDeckCard[];
	name?: string;
	hero?: number;
	format?: FormatType;
	wins?: number;
	losses?: number;
	size: number;
}

export const enum FormatType {
	FT_UNKNOWN = 0,
	FT_WILD = 1,
	FT_STANDARD = 2,
	FT_CLASSIC = 3,
	FT_TWIST = 4,
}

export const enum BnetGameType {
	BGT_UNKNOWN = 0,
	BGT_RANKED_STANDARD = 2,
	BGT_BATTLEGROUNDS = 50,
}

export interface GameStartMessage extends BaseMessage {
	type: "game_start";
	data: BoardStateDeck;
}

export interface GameEndMessage extends BaseMessage {
	type: "game_end";
	data: null;
}
