import * as React from "react";
import Installer, { ConnectionProgress } from "./Installer";

interface RootProps extends React.ClassAttributes<Root> {}

interface RootState {
	authToken: string | null;
	channelId: string | null;
	clientId: string | null;
	connectionProgress: ConnectionProgress;
	initialLoad: boolean;
	working: boolean;
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

	refreshProgress = async (retries: number = 1) => {
		try {
			this.setState({
				working: true,
			});
			const response = await fetch("https://twitch-ebs.hearthsim.net/setup/", {
				method: "POST",
				mode: "cors",
				headers: new Headers({
					Accept: "application/json",
					Authorization: `Bearer ${this.state.authToken}`,
					"X-Twitch-User-Id": this.state.channelId,
					"X-Twitch-Client-Id": this.state.clientId,
					"X-Twitch-Extension-Version": APPLICATION_VERSION,
				}),
			});
			let progress = null;
			switch (response.status) {
				case 200:
					progress = ConnectionProgress.READY;
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
				this.setState({
					working: false,
					initialLoad: true,
					connectionProgress: progress,
				});
			}
		} catch (e) {
			console.error(e);
			this.setState({
				working: false,
				connectionProgress: ConnectionProgress.ERROR,
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
			/>
		);
	}
}
