import * as React from "react";
import styled from "styled-components";

export const enum InstallerProgress {
	UNKNOWN,
	CONNECT_ACCOUNT,
	INSTALL_TRACKER,
	READY,
	ERROR,
}

interface InstallerProps extends React.ClassAttributes<Installer> {
	progress: InstallerProgress;
	refreshProgress: () => void;
	working?: boolean;
}

interface InstallerState {}

const InstallerDiv = styled.div`
	font-family: "Helvetica Neue", helvetica;
	padding: 0 0;
`;

const StepList = styled.ol`color: black;`;

const Step = styled.li`
	margin: 15px 0;

	& p {
		margin: 10px 0;
	}
`;

const BigFriendlyButton = styled.button`
	font-size: 1em;
	display: inline-block;
	padding: 15px 20px;
	color: black;
	font-weight: bold;
	background-color: white;
	border: solid 1px black;
	width: 200px;

	&:hover {
		color: white;
		background-color: black;
		border-color: white;
	}

	&:disabled,
	&:hover:disabled {
		color: black;
		background-color: rgb(244, 244, 244);
		border-color: rgb(136, 136, 136);
	}
`;

const DownloadLink = BigFriendlyButton.withComponent("a").extend`
	text-align: center;
	text-decoration: none;
`;

const ErrorMessage = styled.p`
	margin-top: 5px;
	color: #da645a;
`;

export default class Installer extends React.Component<
	InstallerProps,
	InstallerState
> {
	getErrorMessage(): any {
		switch (this.props.progress) {
			case InstallerProgress.ERROR:
				return <ErrorMessage>Something went wrong.</ErrorMessage>;
			case InstallerProgress.INSTALL_TRACKER:
				return <ErrorMessage>Install a deck tracker</ErrorMessage>;
			case InstallerProgress.CONNECT_ACCOUNT:
				return <ErrorMessage>Connect your account</ErrorMessage>;
		}
	}

	render() {
		if (this.props.progress === InstallerProgress.UNKNOWN) {
			if (this.props.working) {
				return <div>Loading...</div>;
			} else {
				return <div>Unable to connect :-(</div>;
			}
		}

		if (this.props.progress === InstallerProgress.READY) {
			return <div>All good!</div>;
		}

		const refreshButton = (
			<button
				disabled={this.props.working}
				onClick={this.props.refreshProgress}
			>
				Continue
			</button>
		);

		return (
			<InstallerDiv>
				<p>
					Welcome to Hearthstone Deck Tracker! You're just a few steps away from
					adding interactive an interactive overlay to your Stream.
				</p>
				<StepList>
					<Step>
						<p>
							Download Hearthstone Deck Tracker (HDT) and install it (Windows
							only):
						</p>
						<p>
							<DownloadLink
								href={"https://hsdecktracker.net/download/"}
								target={"_blank"}
							>
								Download HDT
							</DownloadLink>
						</p>
					</Step>
					<Step>
						Connect your tracker to HSReplay.net and Twitch:<br />
						<code>Options (Advanced) → Streaming → Twitch Extension</code>
					</Step>
					<Step>
						<p>
							<BigFriendlyButton
								disabled={this.props.working}
								onClick={this.props.refreshProgress}
							>
								{this.props.working ? "Verifying…" : "Complete Setup"}
							</BigFriendlyButton>
						</p>
						{this.getErrorMessage()}
					</Step>
				</StepList>
			</InstallerDiv>
		);
	}
}
