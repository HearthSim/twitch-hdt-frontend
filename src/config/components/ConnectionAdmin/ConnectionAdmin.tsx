import * as React from "react";
import styled from "styled-components";
import ConnectionPreview from "./ConnectionPreview";
import WindowsIcon from "./windows.svg";
import ActivateImage from "./activate.png";
import { ConnectionStatus } from "../../enums";
import {
	ErrorMessage,
	Fieldset,
	Heading,
	SuccessMessage,
} from "../ConfigView/ConfigView";

const Fragment = (React as any).Fragment;

interface ConnectionAdminProps extends React.ClassAttributes<ConnectionAdmin> {
	connectionStatus: ConnectionStatus;
	refreshConnectionStatus: () => any;
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
			filter: invert(100%);
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

const InstructionImage = styled.img`
	border: 1px solid gray;
	margin: 1em 0 0 0;
`;

export default class ConnectionAdmin extends React.Component<
	ConnectionAdminProps
> {
	getMessage() {
		if (this.props.working) {
			return <CenterParagraph>Testing connection…</CenterParagraph>;
		}

		const makeRefresh = (label: string) => (
			<RefreshButton
				disabled={this.props.working}
				onClick={this.props.refreshConnectionStatus}
				key="refresh"
			>
				{label}
			</RefreshButton>
		);

		let message = null;
		let buttons = [makeRefresh("Refresh")];

		switch (this.props.connectionStatus) {
			case ConnectionStatus.READY:
				return (
					<div>
						<CenterParagraph>
							<SuccessMessage>
								Setup complete!<br />Return to the Extension Manager to enable
								the Overlay:
								<InstructionImage src={ActivateImage} />
							</SuccessMessage>
						</CenterParagraph>
						<p>
							You can add another instance of Hearthstone Deck Tracker by
							connecting it from the <code>Twitch Extension</code> option (see
							above).
						</p>
					</div>
				);
			case ConnectionStatus.UPSTREAM_CLIENT_NOT_FOUND:
				message = (
					<ErrorMessage>
						Please connect your deck tracker to HSReplay.net
					</ErrorMessage>
				);
				break;
			case ConnectionStatus.ACCOUNT_NOT_LINKED:
				message = (
					<ErrorMessage>
						Please connect your Twitch account to HSReplay.net.
					</ErrorMessage>
				);
				buttons = [
					<ActionButton
						href="https://hsreplay.net/account/social/connections/#account-twitch-link"
						target="_blank"
						key="action"
					>
						Connect
					</ActionButton>,
				].concat(buttons);
				break;
			case ConnectionStatus.BAD_UPSTREAM:
				message = <ErrorMessage>Unable to connect to Twitch.</ErrorMessage>;
				buttons = [makeRefresh("Try Again")];
				break;
			case ConnectionStatus.ERROR:
			default:
				message = <ErrorMessage>Something went wrong</ErrorMessage>;
				buttons = [makeRefresh("Try Again")];
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
				<Heading>Connection</Heading>
				<p>Download and connect Hearthstone Deck Tracker.</p>
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
				{this.props.connectionStatus !== ConnectionStatus.READY ? (
					<Fragment>
						<p>
							Make sure you've completed the Twitch Extension setup in
							Hearthstone Deck Tracker.
						</p>
						<ConnectionPreview
							working={this.props.working}
							twitch={
								this.props.connectionStatus === ConnectionStatus.ERROR
									? null
									: this.props.connectionStatus >
										ConnectionStatus.ACCOUNT_NOT_LINKED
							}
							tracker={
								this.props.connectionStatus === ConnectionStatus.ERROR
									? null
									: this.props.connectionStatus >
										ConnectionStatus.UPSTREAM_CLIENT_NOT_FOUND
							}
						/>
					</Fragment>
				) : null}
				{this.getMessage()}
			</Fieldset>
		);
	}
}
