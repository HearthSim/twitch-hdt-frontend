import * as React from "react";
import { Fieldset, Heading, ConnectionProgress } from "./Installer";
import styled from "styled-components";
import ConnectionPreview from "./ConnectionPreview";
import WindowsIcon from "./windows.svg";

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

	&:hover {
		color: white;
	}
`;

const CenterParagraph = styled.p`text-align: center;`;

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

const DownloadLink = BigFriendlyButton.withComponent("a").extend`
	margin-top: 1.5em;
	text-align: center;
	text-decoration: none;
`;

const SuccessMessage = styled.span`color: green;`;

const ErrorMessage = styled.span`color: #dd0002;`;

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
			return;
		}
		switch (this.props.progress) {
			case ConnectionProgress.READY:
				return <SuccessMessage>Connected. Waiting for data...</SuccessMessage>;
			case ConnectionProgress.ERROR:
				return <ErrorMessage>Something went wrong.</ErrorMessage>;
			case ConnectionProgress.INSTALL_TRACKER:
				return (
					<ErrorMessage>
						Please connect your deck tracker to HSReplay.net
					</ErrorMessage>
				);
			case ConnectionProgress.CONNECT_ACCOUNT:
				return (
					<ErrorMessage>
						Please connect your Twitch account to HSReplay.net.
					</ErrorMessage>
				);
		}
	}

	render() {
		return (
			<Fieldset>
				<Heading>Deck Tracking</Heading>
				<p>Download and connect your deck tracker.</p>
				<CenterParagraph>
					<DownloadLink
						href={"https://hsdecktracker.net/download/"}
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
				<p>Make sure you've completed the setup in your deck tracker.</p>
				<ConnectionPreview
					twitch={this.props.progress > ConnectionProgress.CONNECT_ACCOUNT}
					tracker={this.props.progress > ConnectionProgress.INSTALL_TRACKER}
				/>
				<CenterParagraph>{this.getMessage()}</CenterParagraph>
				<CenterParagraph>
					{this.props.progress !== ConnectionProgress.READY ? (
						<BigFriendlyButton
							disabled={this.props.working}
							onClick={this.props.refreshProgress}
						>
							{this.props.working ? "Verifying…" : "Refresh"}
						</BigFriendlyButton>
					) : null}
				</CenterParagraph>
			</Fieldset>
		);
	}
}
