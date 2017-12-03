import { Reducer } from "redux";
import {
	Actions,
	COMMIT_SETTINGS,
	GET_SETTINGS,
	SET_CONNECTION_STATUS,
	SET_SETTINGS,
	SET_TWITCH_API_STREAM,
	SET_TWITCH_EXT_AUTHORIZED,
	SET_TWITCH_EXT_CONTEXT,
	UPDATING_CONNECTION_STATUS,
} from "./actions";
import { State } from "./state";
import { ConnectionStatus } from "./enum";

const rootReducer: Reducer<State> = (state, action: Actions[keyof Actions]) => {
	switch (action.type) {
		case UPDATING_CONNECTION_STATUS:
			return Object.assign({}, state, { completingSetup: true });
		case SET_CONNECTION_STATUS:
			return Object.assign({}, state, {
				completingSetup: false,
				connection: Object.assign({}, state.connection, {
					status: action.status,
				}),
				hasInitialized:
					state.hasInitialized || action.status !== ConnectionStatus.ERROR,
			});
		case GET_SETTINGS:
			const status = action.status;
			return Object.assign({}, state, {
				config: Object.assign({}, state.config, {
					settings:
						status === "success" && action.settings
							? action.settings
							: state.config.settings,
					readonly: status === "pending",
				}),
			});
		case SET_SETTINGS:
			return Object.assign({}, state, {
				config: Object.assign({}, state.config, {
					settings: Object.assign({}, state.config.settings, action.settings),
					readonly: action.status === "pending",
				}),
			});
		case SET_TWITCH_EXT_CONTEXT:
			return Object.assign({}, state, {
				twitch: Object.assign({}, state.twitch, { context: action.context }),
			});
		case SET_TWITCH_EXT_AUTHORIZED:
			return Object.assign({}, state, {
				twitch: Object.assign({}, state.twitch, {
					authorized: action.authorized,
				}),
			});
		case SET_TWITCH_API_STREAM:
			return Object.assign({}, state, {
				twitch: Object.assign({}, state.twitch, {
					stream: action.offline ? false : action.stream,
				}),
			});
		default:
			return state;
	}
};

export default rootReducer;
