import * as React from "react";
import styled from "styled-components";
import ConnectionAdmin from "../ConnectionAdmin/ConnectionAdmin";
import { EBSConfiguration } from "../../../twitch-hdt";
import { ConnectionStatus } from "../../enums";
import OverlayAdmin from "../OverlayAdmin";
import OtherAdmin from "../OtherAdmin";

interface Props {
	connectionStatus: ConnectionStatus;
	refreshConnectionStatus: () => any;
	refreshSettings: () => any;
	hasInitialized: boolean;
	working: boolean;
	settings: EBSConfiguration | null;
	setSetting: (key: keyof EBSConfiguration, value: string) => any;
	setTwitchExtContext: (context: TwitchExtContext) => any;
	setTwitchExtAuthorized: (authorized: TwitchExtAuthorized) => any;
}

const Wrapper = styled.div`
	font-family: "Helvetica Neue", helvetica, sans-serif;
	width: 100%;
	min-width: 500px;
	min-height: 100vh;
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	align-items: flex-start;
	justify-content: center;
`;

const MessageWrapper = Wrapper.extend`
	font-size: 1.5em;
	text-align: center;
	align-items: center;
	flex-direction: column;

	p {
		margin: 0.5em;
		width: 100%;
	}
`;

export const Fieldset = styled.fieldset`
	position: relative;
	padding: 25px;
	margin: 10px 10px 0 10px;
	width: 500px;
	background-color: #fbfbfb;
	border: solid 1px gray;
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
		window.Twitch.ext.onContext((context: TwitchExtContext) =>
			this.props.setTwitchExtContext(context),
		);
		window.Twitch.ext.onAuthorized((auth: TwitchExtAuthorized) => {
			this.props.setTwitchExtAuthorized(auth);
			if (!this.props.hasInitialized) {
				this.props.refreshConnectionStatus();
				this.props.refreshSettings();
			}
		});
	}

	public render(): React.ReactNode {
		if (!this.props.hasInitialized) {
			if (this.props.working) {
				return (
					<MessageWrapper>
						<p>Loading setup…</p>
						<p>This might take a few moments.</p>
					</MessageWrapper>
				);
			} else {
				return (
					<MessageWrapper>
						<p>Unable to reach extension backend service</p>
						<p>
							Please check your browser extensions, or if this persists, contact
							us at{" "}
							<a href="mailto:support@hearthsim.net">support@hearthsim.net</a>.
						</p>
					</MessageWrapper>
				);
			}
		}

		const setupComplete =
			this.props.connectionStatus === ConnectionStatus.READY;

		return (
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
		);
	}
}
