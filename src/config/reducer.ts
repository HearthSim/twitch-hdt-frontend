import { Reducer } from "redux";
import {
	Actions,
	PREVIEW_SETTINGS,
	ROLLBACK_SETTINGS,
	SET_CONNECTION_STATUS,
	SET_TWITCH_API_STREAM,
	SET_TWITCH_EXT_AUTHORIZED,
	SET_TWITCH_EXT_CONTEXT,
	UPDATE_SETTINGS,
	UPDATING_CONNECTION_STATUS,
} from "./actions";
import { ConnectionStatus } from "./enums";
import { State } from "./state";

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
		case UPDATE_SETTINGS:
			const status = action.status;
			return Object.assign({}, state, {
				config: Object.assign({}, state.config, {
					settings:
						status === "success" && action.settings !== null
							? action.settings
							: state.config.settings,
					preview: status === "pending" ? state.config.preview : null,
					readonly: status === "pending",
				}),
			});
		case PREVIEW_SETTINGS:
			return Object.assign({}, state, {
				config: Object.assign({}, state.config, {
					preview: action.settings,
				}),
			});
		case ROLLBACK_SETTINGS:
			return Object.assign({}, state, {
				config: Object.assign({}, state.config, {
					preview: null,
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
