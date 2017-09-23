export type Message = BaseMessage | BoardStateMessage | GameEndMessage;

interface BaseMessage {
	type: string;
}

export interface BoardStateMessage extends BaseMessage {
	type: "board_state";
	data: BoardStateData;
}

export interface BoardStateData {
	player_board: number[];
	player_hand: number[];
	player_hero: number | null;
	player_deck: { [dbf: number]: number[] };
	opponent_board: number[];
}

export interface GameEndMessage extends BaseMessage {
	type: "game_end";
}
