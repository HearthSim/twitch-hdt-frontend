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
		readonly context: Twitch.ext.Context | null;
		readonly authorized: Twitch.ext.Authorized | null;
		readonly stream: TwitchApiStream | false | null;
	};
}

export const initialState: State = {
	completingSetup: false,
	config: {
		defaults: {
			deck_position: "topright",
			game_offset_horizontal: "0",
			hidden: "0",
		},
		preview: null,
		readonly: false,
		settings: null,
	},
	connection: { status: ConnectionStatus.UNKNOWN },
	hasInitialized: false,
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
		"X-Twitch-Client-Id": authorized.clientId,
		"X-Twitch-Extension-Version": APPLICATION_VERSION,
		"X-Twitch-User-Id": authorized.channelId,
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
