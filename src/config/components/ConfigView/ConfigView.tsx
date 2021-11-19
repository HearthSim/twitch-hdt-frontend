import * as React from "react";
import styled, { ThemeProvider } from "styled-components";
import { EBSConfiguration } from "../../../twitch-hdt";
import { darkTheme, lightTheme } from "../../../utils/theming";
import { ConnectionStatus } from "../../enums";
import ConnectionAdmin from "../ConnectionAdmin/ConnectionAdmin";
import OtherAdmin from "../OtherAdmin";
import OverlayAdmin from "../OverlayAdmin";

interface Props {
	connectionStatus: ConnectionStatus;
	refreshConnectionStatus: () => any;
	refreshSettings: () => any;
	hasInitialized: boolean;
	working: boolean;
	settings: EBSConfiguration | null;
	setSetting: (key: keyof EBSConfiguration, value: string) => any;
	twitchExtContext: Twitch.ext.Context | null;
	setTwitchExtContext: (context: Partial<Twitch.ext.Context>) => any;
	setTwitchExtAuthorized: (authorized: Twitch.ext.Authorized) => any;
}

const Wrapper = styled.div`
	font-family: "Helvetica Neue", helvetica, sans-serif;
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	align-items: flex-start;
	justify-content: center;
	color: ${(props) => props.theme.textColor};
`;

const MessageWrapper = styled(Wrapper)`
	margin: auto auto;
	height: 100%;
	font-size: 1.25em;
	text-align: center;
	align-items: center;
	flex-direction: column;
	color: ${(props) => props.theme.textColor};
	width: 100%;

	overflow: hidden;

	p {
		margin: 0.5em;
		width: 100%;

		&:first-child {
			margin-top: 0;
		}
	}
`;

export const Fieldset = styled.fieldset`
	position: relative;
	padding: 25px;
	margin: 10px 10px 0 10px;
	width: 500px;
	//background-color: #fbfbfb;
	//border: solid 1px gray;
	z-index: 1;
`;

export const FieldsetShield = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.7);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 10;
	padding: 10px;

	span {
		color: #eee;
		text-align: center;
		font-size: 1em;
	}
`;

export const Heading = styled.h1`
	margin-top: 0;
`;

export const SuccessMessage = styled.span`
	color: green;
`;

export const ErrorMessage = styled.span`
	color: #dd0002;
`;

export default class ConfigView extends React.Component<Props> {
	public componentDidMount(): void {
		window.Twitch.ext.onContext((context: Partial<Twitch.ext.Context>) =>
			this.props.setTwitchExtContext(context),
		);
		window.Twitch.ext.onAuthorized((auth: Twitch.ext.Authorized) => {
			this.props.setTwitchExtAuthorized(auth);
			if (!this.props.hasInitialized) {
				this.props.refreshConnectionStatus();
				this.props.refreshSettings();
			}
		});
	}

	public render(): React.ReactNode {
		const theme =
			this.props.twitchExtContext &&
			this.props.twitchExtContext.theme === "dark"
				? darkTheme
				: lightTheme;

		if (!this.props.hasInitialized) {
			return (
				<ThemeProvider theme={theme}>
					{this.props.working ? (
						<MessageWrapper>
							<p>Loading setup…</p>
							<p>This might take a few moments.</p>
						</MessageWrapper>
					) : (
						<MessageWrapper>
							<p>Unable to reach extension backend service</p>
							<p>
								Please check your browser extensions, or if this persists,
								contact us at{" "}
								<a href="mailto:support@hearthsim.net">support@hearthsim.net</a>
								.
							</p>
						</MessageWrapper>
					)}
				</ThemeProvider>
			);
		}

		const setupComplete =
			this.props.connectionStatus === ConnectionStatus.READY;

		return (
			<ThemeProvider theme={theme}>
				<Wrapper>
					<ConnectionAdmin
						working={this.props.working}
						connectionStatus={this.props.connectionStatus}
						refreshConnectionStatus={this.props.refreshConnectionStatus}
					/>
					<OverlayAdmin>
						{!setupComplete ? (
							<FieldsetShield>
								<span>Connection setup required</span>
							</FieldsetShield>
						) : null}
					</OverlayAdmin>
					<OtherAdmin>
						{!setupComplete ? (
							<FieldsetShield>
								<span>Connection setup required</span>
							</FieldsetShield>
						) : null}
					</OtherAdmin>
				</Wrapper>
			</ThemeProvider>
		);
	}
}
