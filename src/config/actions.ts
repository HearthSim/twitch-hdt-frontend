import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { TwitchApiStream } from "../twitch-api";
import { EBSConfiguration } from "../twitch-hdt";
import { ConnectionStatus } from "./enums";
import { getEBSHeaders, getTwitchAPIHeaders, State } from "./state";

export const UPDATING_CONNECTION_STATUS = "UPDATING_CONNECTION_STATUS";
export const SET_CONNECTION_STATUS = "SET_CONNECTION_STATUS";
export const UPDATE_SETTINGS = "UPDATE_SETTINGS";
export const PREVIEW_SETTINGS = "PREVIEW_SETTINGS";
export const ROLLBACK_SETTINGS = "ROLLBACK_SETTINGS";
export const SET_TWITCH_EXT_CONTEXT = "SET_TWITCH_EXT_CONTEXT";
export const SET_TWITCH_EXT_AUTHORIZED = "SET_TWITCH_EXT_AUTHORIZED";
export const SET_TWITCH_API_STREAM = "SET_TWITCH_API_STREAM";

export interface Actions {
	UPDATING_CONNECTION_STATUS: {
		type: typeof UPDATING_CONNECTION_STATUS;
	};
	SET_CONNECTION_STATUS: {
		type: typeof SET_CONNECTION_STATUS;
		status: ConnectionStatus;
	};
	UPDATE_SETTINGS: {
		type: typeof UPDATE_SETTINGS;
		status: "pending" | "success" | "error";
		settings?: EBSConfiguration;
	};
	PREVIEW_SETTINGS: {
		type: typeof PREVIEW_SETTINGS;
		settings?: EBSConfiguration | null;
	};
	ROLLBACK_SETTINGS: {
		type: typeof ROLLBACK_SETTINGS;
	};
	SET_TWITCH_EXT_CONTEXT: {
		type: typeof SET_TWITCH_EXT_CONTEXT;
		context: Twitch.ext.Context;
	};
	SET_TWITCH_EXT_AUTHORIZED: {
		type: typeof SET_TWITCH_EXT_AUTHORIZED;
		authorized: Twitch.ext.Authorized;
	};
	SET_TWITCH_API_STREAM: {
		type: typeof SET_TWITCH_API_STREAM;
		stream: TwitchApiStream;
		offline: boolean;
	};
}

export type ActionTypes = Actions[keyof Actions];

const getSettings = (): ThunkAction<void, State, null, Action<any>> => async (
	dispatch,
	getState,
) => {
	dispatch({
		status: "pending",
		type: UPDATE_SETTINGS,
	});
	try {
		const response = await fetch("https://twitch-ebs.hearthsim.net/config/", {
			headers: new Headers({
				Accept: "application/json",
				...getEBSHeaders(getState()),
			}),
			method: "GET",
			mode: "cors",
		});
		if (response.status !== 200) {
			throw new Error("Invalid status code from EBS");
		}
		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error(`Invalid content type "${contentType}" from EBS`);
		}
		let settings = await response.json();
		settings = Object.assign({}, getState().config.defaults, settings);
		dispatch({
			settings,
			status: "success",
			type: UPDATE_SETTINGS,
		});
	} catch (e) {
		dispatch({
			status: "error",
			type: UPDATE_SETTINGS,
		});
	}
};

const setSetting = (
	setting: keyof EBSConfiguration,
	value: any,
): ThunkAction<void, State, null, Action> => async (dispatch, getState) =>
	dispatch(setSettings({ [setting]: value }));

const setSettings = (
	settings: EBSConfiguration,
): ThunkAction<void, State, null, Action> => async (dispatch, getState) => {
	const config = getState().config;
	if (!settings || !config.settings || config.readonly) {
		return;
	}
	dispatch(actionCreators.previewSettings(settings));
	dispatch(actionCreators.commitSettings());
};

const commitSettings = (): ThunkAction<void, State, null, Action> => async (
	dispatch,
	getState,
) => {
	const config = getState().config;
	if (!config.settings || !config.preview || config.readonly) {
		return;
	}
	try {
		dispatch({
			status: "pending",
			type: UPDATE_SETTINGS,
		});
		const proposedSettings = Object.assign({}, config.settings, config.preview);
		const response = await fetch("https://twitch-ebs.hearthsim.net/config/", {
			body: JSON.stringify(proposedSettings),
			headers: new Headers({
				"Content-Type": "application/json",
				...getEBSHeaders(getState()),
			}),
			method: "PUT",
			mode: "cors",
		});
		if (response.status !== 200) {
			throw new Error("Invalid status code from EBS");
		}
		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error(`Invalid content type "${contentType}" from EBS`);
		}
		const settings = await response.json();
		dispatch({
			settings,
			status: "success",
			type: UPDATE_SETTINGS,
		});
	} catch (e) {
		dispatch({
			status: "error",
			type: UPDATE_SETTINGS,
		});
	}
};

const updateConnectionStatus = (): ThunkAction<
	void,
	State,
	null,
	Action
> => async (dispatch, getState) => {
	dispatch({
		type: UPDATING_CONNECTION_STATUS,
	});
	try {
		const response = await fetch("https://twitch-ebs.hearthsim.net/setup/", {
			headers: new Headers({
				Accept: "application/json",
				...getEBSHeaders(getState()),
			}),
			method: "POST",
			mode: "cors",
		});
		switch (response.status) {
			case 200:
				return dispatch(
					actionCreators.setConnectionStatus(ConnectionStatus.READY),
				);
			case 403:
			case 502:
				const contentType = response.headers.get("content-type");
				if (!contentType || !contentType.includes("application/json")) {
					throw new Error(`Invalid response content type "${contentType}"`);
				}
				const responsePayload = await response.json();
				const { error } = responsePayload;
				switch (error) {
					case "account_not_linked":
						return dispatch(
							actionCreators.setConnectionStatus(
								ConnectionStatus.ACCOUNT_NOT_LINKED,
							),
						);
					case "upstream_client_not_found":
						return dispatch(
							actionCreators.setConnectionStatus(
								ConnectionStatus.UPSTREAM_CLIENT_NOT_FOUND,
							),
						);
					case "bad_upstream":
						return dispatch(
							actionCreators.setConnectionStatus(ConnectionStatus.BAD_UPSTREAM),
						);
					default:
						throw new Error(`Invalid error "${error}"`);
				}
			default:
				throw new Error(`Unexpected status code ${response.status}`);
		}
	} catch (e) {
		return dispatch(actionCreators.setConnectionStatus(ConnectionStatus.ERROR));
	}
};

export const actionCreators = {
	updateConnectionStatus,
	setConnectionStatus: (
		status: ConnectionStatus,
	): Actions[typeof SET_CONNECTION_STATUS] => ({
		status,
		type: SET_CONNECTION_STATUS,
	}),
	getSettings,
	setSetting,
	setSettings,
	previewSettings: (settings: EBSConfiguration) => ({
		settings,
		type: PREVIEW_SETTINGS,
	}),
	commitSettings,
	rollbackSettings: () => ({
		type: ROLLBACK_SETTINGS,
	}),
	setTwitchExtContext: (
		context: Twitch.ext.Context,
	): Actions[typeof SET_TWITCH_EXT_CONTEXT] => ({
		context,
		type: SET_TWITCH_EXT_CONTEXT,
	}),
	setTwitchExtAuthorized: (
		authorized: Twitch.ext.Authorized,
	): Actions[typeof SET_TWITCH_EXT_AUTHORIZED] => ({
		authorized,
		type: SET_TWITCH_EXT_AUTHORIZED,
	}),
};
