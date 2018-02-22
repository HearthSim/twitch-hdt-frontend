import { TwitchApiStream } from "../twitch-api";
import { EBSConfiguration } from "../twitch-hdt";
import { ConnectionStatus } from "./enums";

export interface State {
	readonly hasInitialized: boolean;
	readonly completingSetup: boolean;
	readonly connection: {
		readonly status: ConnectionStatus;
	};
	readonly config: {
		readonly settings: EBSConfiguration | null;
		readonly preview: EBSConfiguration | null;
		readonly readonly: boolean;
		readonly defaults: EBSConfiguration;
	};
	readonly twitch: {
		readonly context: TwitchExtContext | null;
		readonly authorized: TwitchExtAuthorized | null;
		readonly stream: TwitchApiStream | false | null;
	};
}

export const initialState: State = {
	hasInitialized: false,
	completingSetup: false,
	connection: { status: ConnectionStatus.UNKNOWN },
	config: {
		settings: null,
		preview: null,
		readonly: false,
		defaults: {
			deck_position: "topright",
			hidden: "0",
			game_offset_horizontal: "0",
		},
	},
	twitch: { context: null, authorized: null, stream: null },
};

export const getEBSHeaders = (state: State): { [header: string]: string } => {
	const authorized = state.twitch.authorized;
	if (authorized === null) {
		throw new Error(
			"Cannot generate headers for EBS without Twitch authorization",
		);
	}
	return {
		Authorization: `Bearer ${authorized.token}`,
		"X-Twitch-User-Id": authorized.channelId,
		"X-Twitch-Client-Id": authorized.clientId,
		"X-Twitch-Extension-Version": APPLICATION_VERSION,
	};
};

export const getTwitchAPIHeaders = (
	state: State,
): { [header: string]: string } => {
	const authorized = state.twitch.authorized;
	if (authorized === null) {
		throw new Error(
			"Cannot generate headers for API without Twitch authorization",
		);
	}
	return {
		"Client-Id": authorized.clientId,
	};
};
