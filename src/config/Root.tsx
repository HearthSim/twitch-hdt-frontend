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
		//this.refreshProgress(); // todo remove dev fixture
	}

	refreshProgress = async () => {
		try {
			this.setState({ working: true });
			const result = await fetch(
				"https://z59gjcr38l.execute-api.us-east-1.amazonaws.com/dev/setup/",
				{
					headers: new Headers({
						Authorization: `Bearer ${this.state.authToken}`,
						"X-Twitch-User-Id": this.state.clientId,
						"X-Twitch-Client-Id": this.state.clientId,
						"X-Twitch-Extension-Version": APPLICATION_VERSION,
					}),
				},
			);
			if (result.status !== 200) {
				throw new Error(`Unexpected status code ${result.status}`);
			}
			const json = await result.json();
			this.setState({
				working: false,
				installerProgress: InstallerProgress.CONNECT_ACCOUNT,
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
