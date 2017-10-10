import * as React from "react";
import Installer, { ConnectionProgress } from "./Installer";
import { EBSConfiguration } from "../twitch-hdt";
import { defaultConfiguration } from "../utils/config";

interface RootProps extends React.ClassAttributes<Root> {}

interface RootState {
	authToken: string | null;
	channelId: string | null;
	clientId: string | null;
	connectionProgress: ConnectionProgress;
	initialLoad: boolean;
	working: boolean;
	configuration: EBSConfiguration | null;
}

export default class Root extends React.Component<RootProps, RootState> {
	constructor(props: RootProps, context: any) {
		super(props, context);
		this.state = {
			authToken: null,
			channelId: null,
			clientId: null,
			connectionProgress: ConnectionProgress.UNKNOWN,
			initialLoad: false,
			working: true,
			configuration: null,
		};
	}

	async componentDidMount() {
		window.Twitch.ext.onAuthorized(async auth => {
			console.debug(auth);
			this.setState(
				{
					authToken: auth.token,
					channelId: auth.channelId,
					clientId: auth.clientId,
				},
				() => this.refreshProgress(3),
			);
		});
	}

	getHeaders() {
		return {
			Accept: "application/json",
			Authorization: `Bearer ${this.state.authToken}`,
			"X-Twitch-User-Id": this.state.channelId,
			"X-Twitch-Client-Id": this.state.clientId,
			"X-Twitch-Extension-Version": APPLICATION_VERSION,
		};
	}

	refreshProgress = async (retries: number = 1) => {
		try {
			this.setState({
				working: true,
			});
			const response = await fetch("https://twitch-ebs.hearthsim.net/setup/", {
				method: "POST",
				mode: "cors",
				headers: new Headers(this.getHeaders()),
			});
			let keepWorking = false;
			let progress: ConnectionProgress | null = null;
			switch (response.status) {
				case 200:
					progress = ConnectionProgress.READY;
					this.refreshConfiguration();
					keepWorking = true;
					break;
				case 403:
					const contentType = response.headers.get("content-type");
					if (!contentType || !contentType.includes("application/json")) {
						throw new Error(`Invalid response content type "${contentType}"`);
					}
					const responsePayload = await response.json();
					const { error } = responsePayload;
					switch (error) {
						case "account_not_linked":
							progress = ConnectionProgress.CONNECT_ACCOUNT;
							break;
						case "upstream_client_not_found":
							progress = ConnectionProgress.INSTALL_TRACKER;
							break;
						default:
							throw new Error(`Invalid error "${error}"`);
					}
					break;
				default:
					if (retries > 0) {
						this.refreshProgress(retries - 1);
						break;
					} else {
						throw new Error(`Unexpected status code ${response.status}`);
					}
			}
			if (progress !== null) {
				this.setState(prevState => {
					const state = Object.assign({}, prevState, {
						initialLoad: true,
						connectionProgress: progress,
					});
					if (!keepWorking) {
						state.working = false;
					}
					return state;
				});
			}
		} catch (e) {
			this.setState({
				working: false,
				connectionProgress: ConnectionProgress.ERROR,
			});
		}
	};

	refreshConfiguration = async () => {
		try {
			this.setState({
				working: true,
			});
			const response = await fetch("https://twitch-ebs.hearthsim.net/config/", {
				method: "GET",
				mode: "cors",
				headers: new Headers(this.getHeaders()),
			});
			const received = await response.json();
			const configuration: EBSConfiguration = {};
			Object.keys(received)
				.filter(k => !!received[k])
				.forEach(
					(k: keyof EBSConfiguration) => (configuration[k] = received[k]),
				);
			this.setState({
				configuration,
				working: false,
			});
		} catch (e) {
			this.setState({
				working: false,
			});
		}
	};

	putConfiguration = async (configuration: EBSConfiguration) => {
		try {
			const previousConfiguration = Object.assign({}, this.state.configuration);
			const proposedConfiguration = Object.assign(
				{},
				defaultConfiguration,
				this.state.configuration,
				configuration,
			);
			this.setState({
				working: true,
				configuration: proposedConfiguration,
			});
			const response = await fetch("https://twitch-ebs.hearthsim.net/config/", {
				method: "PUT",
				mode: "cors",
				headers: new Headers({
					"Content-Type": "application/json",
					...this.getHeaders(),
				}),
				body: JSON.stringify(proposedConfiguration),
			});
			let newConfiguration = previousConfiguration;
			if (response.status === 200) {
				try {
					newConfiguration = await response.json();
				} catch (e) {}
			}
			this.setState({
				working: false,
				configuration: newConfiguration,
			});
		} catch (e) {
			this.setState({
				working: false,
			});
		}
	};

	render() {
		return (
			<Installer
				progress={this.state.connectionProgress}
				refreshProgress={this.refreshProgress}
				working={this.state.working}
				initialLoad={!this.state.initialLoad}
				configuration={this.state.configuration}
				setConfiguration={this.putConfiguration}
			/>
		);
	}
}
