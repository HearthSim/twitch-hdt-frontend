import { EBSConfiguration } from "../twitch-hdt";
import { ConnectionStatus } from "./enum";
import { Dispatch } from "redux";
import { getEBSHeaders, getTwitchAPIHeaders, State } from "./state";
import { TwitchApiStream } from "../twitch-api";

export const UPDATING_CONNECTION_STATUS = "UPDATING_CONNECTION_STATUS";
export const SET_CONNECTION_STATUS = "SET_CONNECTION_STATUS";
export const SET_SETTINGS = "SET_SETTINGS";
export const PUT_SETTINGS = "PUT_SETTINGS";
export const GET_SETTINGS = "GET_SETTINGS";
export const COMMIT_SETTINGS = "COMMIT_SETTINGS";
export const SET_TWITCH_EXT_CONTEXT = "SET_TWITCH_EXT_CONTEXT";
export const SET_TWITCH_EXT_AUTHORIZED = "SET_TWITCH_EXT_AUTHORIZED";
export const SET_TWITCH_API_STREAM = "SET_TWITCH_API_STREAM";

export type Actions = {
	UPDATING_CONNECTION_STATUS: {
		type: typeof UPDATING_CONNECTION_STATUS;
	};
	SET_CONNECTION_STATUS: {
		type: typeof SET_CONNECTION_STATUS;
		status: ConnectionStatus;
	};
	PUT_SETTINGS: {
		type: typeof PUT_SETTINGS;
	};
	GET_SETTINGS: {
		type: typeof GET_SETTINGS;
		status: "pending" | "success" | "error";
		settings?: EBSConfiguration;
	};
	SET_SETTINGS: {
		type: typeof SET_SETTINGS;
		status: "pending" | "complete";
		settings: EBSConfiguration;
	};
	SET_TWITCH_EXT_CONTEXT: {
		type: typeof SET_TWITCH_EXT_CONTEXT;
		context: TwitchExtContext;
	};
	SET_TWITCH_EXT_AUTHORIZED: {
		type: typeof SET_TWITCH_EXT_AUTHORIZED;
		authorized: TwitchExtAuthorized;
	};
	SET_TWITCH_API_STREAM: {
		type: typeof SET_TWITCH_API_STREAM;
		stream: TwitchApiStream;
	};
};

const getSettings = () => async (
	dispatch: Dispatch<State>,
	getState: () => State,
) => {
	dispatch({
		type: GET_SETTINGS,
		status: "pending",
	});
	try {
		const response = await fetch("https://twitch-ebs.hearthsim.net/config/", {
			method: "GET",
			mode: "cors",
			headers: new Headers({
				Accept: "application/json",
				...getEBSHeaders(getState()),
			}),
		});
		if (response.status !== 200) {
			throw new Error("Invalid status code from EBS");
		}
		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error(`Invalid content type "${contentType}" from EBS`);
		}
		dispatch({
			type: GET_SETTINGS,
			status: "success",
			settings: await response.json(),
		});
	} catch (e) {
		dispatch({
			type: GET_SETTINGS,
			status: "error",
		});
	}
};

const setSetting = (key: keyof EBSConfiguration, value: string): any => async (
	dispatch: Dispatch<State>,
	getState: () => State,
) => {
	if (getState().config.readonly) {
		return;
	}
	let settings = getState().config.settings;
	try {
		const proposedSettings = Object.assign({}, settings, {
			[key]: value,
		});
		dispatch({
			type: SET_SETTINGS,
			settings: proposedSettings,
			status: "pending",
		});
		const response = await fetch("https://twitch-ebs.hearthsim.net/config/", {
			method: "PUT",
			mode: "cors",
			headers: new Headers({
				"Content-Type": "application/json",
				...getEBSHeaders(getState()),
			}),
			body: JSON.stringify(proposedSettings),
		});
		if (response.status !== 200) {
			throw new Error("Invalid status code from EBS");
		}
		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error(`Invalid content type "${contentType}" from EBS`);
		}
		settings = await response.json();
	} catch (e) {
	} finally {
		dispatch({
			type: SET_SETTINGS,
			settings: settings,
			status: "complete",
		});
	}
};

const updateConnectionStatus = () => async (
	dispatch: Dispatch<State>,
	getState: () => State,
) => {
	dispatch({
		type: UPDATING_CONNECTION_STATUS,
	});
	try {
		const response = await fetch("https://twitch-ebs.hearthsim.net/setup/", {
			method: "POST",
			mode: "cors",
			headers: new Headers({
				Accept: "application/json",
				...getEBSHeaders(getState()),
			}),
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

const refreshStreamData = () => async (
	dispatch: Dispatch<State>,
	getState: () => State,
) => {
	const state: State = getState();
	if (!state.twitch.authorized) {
		return;
	}
	try {
		const response = await fetch(
			`https://api.twitch.tv/helix/streams?user_id=${
				state.twitch.authorized.channelId
			}`,
			{
				method: "GET",
				mode: "cors",
				headers: new Headers({
					Accept: "application/json",
					...getTwitchAPIHeaders(getState()),
				}),
			},
		);
		switch (response.status) {
			case 200:
				const json = await response.json();
				const data = json["data"];
				const stream: TwitchApiStream = data[0];
				return dispatch({ type: SET_TWITCH_API_STREAM, stream: stream });
			default:
				throw new Error(`Unexpected status code ${response.status}`);
		}
	} catch (e) {}
};

export const actionCreators = {
	updateConnectionStatus,
	setConnectionStatus: (
		status: ConnectionStatus,
	): Actions[typeof SET_CONNECTION_STATUS] => ({
		type: SET_CONNECTION_STATUS,
		status: status,
	}),
	refreshStreamData,
	getSettings,
	setSetting,
	setTwitchExtContext: (
		context: TwitchExtContext,
	): Actions[typeof SET_TWITCH_EXT_CONTEXT] => ({
		type: SET_TWITCH_EXT_CONTEXT,
		context,
	}),
	setTwitchExtAuthorized: (
		authorized: TwitchExtAuthorized,
	): Actions[typeof SET_TWITCH_EXT_AUTHORIZED] => ({
		type: SET_TWITCH_EXT_AUTHORIZED,
		authorized: authorized,
	}),
};
