import * as React from "react";
import {
	ConnectionProgress,
	ErrorMessage,
	Fieldset,
	Heading,
	SuccessMessage,
} from "./Installer";
import styled from "styled-components";
import ConnectionPreview from "./ConnectionPreview";
import WindowsIcon from "./windows.svg";
import ActivateImage from "./activate.png";

interface ConnectionSetupProps extends React.ClassAttributes<ConnectionSetup> {
	progress: ConnectionProgress;
	refreshProgress: () => void;
	working?: boolean;
}

const Icon = styled.img`
	height: 1.5em;
	vertical-align: middle;
	margin-top: -3px;
	margin-right: 0.7em;
`;

const CenterParagraph = styled.p`
	text-align: center;
`;

const CenterDiv = styled.div`
	text-align: center;
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

		& > img {
			filter: invert();
		}
	}

	&:disabled,
	&:hover:disabled {
		color: black;
		background-color: rgb(244, 244, 244);
		border-color: rgb(136, 136, 136);
	}
`;

const RefreshButton = BigFriendlyButton.extend`
	width: auto;
	min-width: 100px;
	font-weight: normal;
	cursor: pointer;

	a + &,
	button + & {
		margin-left: 6px;
	}
`;

const ActionButton = (BigFriendlyButton.withComponent("a") as any).extend`
	text-align: center;
	text-decoration: none;
	color: black;
	width: auto;
	min-width: 200px;
`;

const DownloadLink = (BigFriendlyButton.withComponent("a") as any).extend`
	margin-top: 1.5em;
	text-align: center;
	text-decoration: none;
`;

const TrackerInstructions = styled.code`
	display: block;
	font-family: monospace;
	font-size: 1.1em;
	white-space: nowrap;
	margin: 0.4em 0 3em 0;
`;

export default class ConnectionSetup extends React.Component<
	ConnectionSetupProps,
	{}
> {
	getMessage() {
		if (this.props.working) {
			return <CenterParagraph>Testing connection…</CenterParagraph>;
		}

		const makeRefresh = (label: string) => (
			<RefreshButton
				disabled={this.props.working}
				onClick={this.props.refreshProgress}
			>
				{label}
			</RefreshButton>
		);

		let message = null;
		let buttons = [makeRefresh("Refresh")];

		switch (this.props.progress) {
			case ConnectionProgress.READY:
				return (
					<div>
						<CenterParagraph>
							<SuccessMessage>
								Setup complete!<br />Return to the Extension Manager to enable
								the Overlay:
								<img src={ActivateImage} />
							</SuccessMessage>
						</CenterParagraph>
						<p>
							You can add another instance of Hearthstone Deck Tracker by
							connecting it from the <code>Twitch Extension</code> option (see
							above).
						</p>
					</div>
				);
			case ConnectionProgress.ERROR:
				message = <ErrorMessage>Something went wrong</ErrorMessage>;
				buttons = [makeRefresh("Try again")];
				break;
			case ConnectionProgress.INSTALL_TRACKER:
				message = (
					<ErrorMessage>
						Please connect your deck tracker to HSReplay.net
					</ErrorMessage>
				);
				break;
			case ConnectionProgress.CONNECT_ACCOUNT:
				message = (
					<ErrorMessage>
						Please connect your Twitch account to HSReplay.net.
					</ErrorMessage>
				);
				buttons = [
					<ActionButton
						href="https://hsreplay.net/account/social/connections/#account-twitch-link"
						target="_blank"
					>
						Connect
					</ActionButton>,
				].concat(buttons);
				break;
		}

		return (
			<CenterDiv>
				<p>{message}</p>
				{buttons.length ? <p>{buttons}</p> : null}
			</CenterDiv>
		);
	}

	render() {
		return (
			<Fieldset>
				<Heading>Deck Tracking</Heading>
				<p>Download and connect Hearthstone Deck Tracker.</p>
				<CenterParagraph>
					<DownloadLink
						href={"https://hsdecktracker.net/download-twitch/"}
						target={"_blank"}
					>
						<Icon src={WindowsIcon} />
						Download HDT
					</DownloadLink>
				</CenterParagraph>
				<CenterParagraph>
					After installing:<br />
					<TrackerInstructions>
						Options (Advanced) → Streaming → Twitch Extension
					</TrackerInstructions>
				</CenterParagraph>
				<p>
					Make sure you've completed the Twitch Extension setup in Hearthstone
					Deck Tracker.
				</p>
				<ConnectionPreview
					working={this.props.working}
					twitch={
						this.props.progress === ConnectionProgress.ERROR
							? null
							: this.props.progress > ConnectionProgress.CONNECT_ACCOUNT
					}
					tracker={
						this.props.progress === ConnectionProgress.ERROR
							? null
							: this.props.progress > ConnectionProgress.INSTALL_TRACKER
					}
				/>
				{this.getMessage()}
			</Fieldset>
		);
	}
}
