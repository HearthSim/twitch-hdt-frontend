import * as React from "react";
import Installer, { InstallerProgress } from "./Installer";

interface RootProps extends React.ClassAttributes<Root> {}

interface RootState {
	authToken: string | null;
	channelId: string | null;
	clientId: string | null;
	installerProgress: InstallerProgress;
	working: boolean;
}

export default class Root extends React.Component<RootProps, RootState> {
	constructor(props: RootProps, context: any) {
		super(props, context);
		this.state = {
			authToken: null,
			channelId: null,
			clientId: null,
			installerProgress: InstallerProgress.UNKNOWN,
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
				this.refreshProgress,
			);
		});
	}

	refreshProgress = async () => {
		try {
			this.setState({ working: true });
			const response = await fetch(
				"https://z59gjcr38l.execute-api.us-east-1.amazonaws.com/dev/setup/",
				{
					method: "POST",
					mode: "cors",
					headers: new Headers({
						Accept: "application/json",
						Authorization: `Bearer ${this.state.authToken}`,
						"X-Twitch-User-Id": this.state.channelId,
						"X-Twitch-Client-Id": this.state.clientId,
						"X-Twitch-Extension-Version": APPLICATION_VERSION,
					}),
				},
			);
			let progress = null;
			switch (response.status) {
				case 200:
					progress = InstallerProgress.READY;
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
							progress = InstallerProgress.CONNECT_ACCOUNT;
							break;
						case "upstream_client_not_found":
							progress = InstallerProgress.INSTALL_TRACKER;
							break;
						default:
							throw new Error(`Invalid error "${error}"`);
					}
					break;
				default:
					throw new Error(`Unexpected status code ${response.status}`);
			}
			this.setState({
				working: false,
				installerProgress: progress,
			});
		} catch (e) {
			console.error(e);
			this.setState({
				working: false,
				installerProgress: InstallerProgress.ERROR,
			});
		}
	};

	render() {
		return (
			<Installer
				progress={this.state.installerProgress}
				refreshProgress={this.refreshProgress}
				working={this.state.working}
			/>
		);
	}
}
