import { ConnectionStatus } from "./enum";
import { EBSConfiguration } from "../twitch-hdt";

export type State = {
	readonly hasInitialized: boolean;
	readonly completingSetup: boolean;
	readonly connection: {
		readonly status: ConnectionStatus;
	};
	readonly config: {
		readonly settings: EBSConfiguration | null;
		readonly readonly: boolean;
	};
	readonly twitch: {
		readonly context: TwitchExtContext | null;
		readonly authorized: TwitchExtAuthorized | null;
	};
};

export const initialState: State = {
	hasInitialized: false,
	completingSetup: false,
	connection: { status: ConnectionStatus.UNKNOWN },
	config: { readonly: false, settings: null },
	twitch: { context: null, authorized: null },
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
