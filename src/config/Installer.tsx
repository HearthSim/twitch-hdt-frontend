import * as React from "react";
import styled from "styled-components";
import OverlaySetup from "./OverlaySetup";
import ConnectionSetup from "./ConnectionSetup";

export const enum ConnectionProgress {
	UNKNOWN,
	ERROR,
	CONNECT_ACCOUNT,
	INSTALL_TRACKER,
	READY,
}

interface InstallerProps extends React.ClassAttributes<Installer> {
	progress: ConnectionProgress;
	refreshProgress: () => void;
	initialLoad?: boolean;
	working?: boolean;
}

interface InstallerState {}

const Wrapper = styled.div`
	font-family: "Helvetica Neue", helvetica;
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
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

export default class Installer extends React.Component<
	InstallerProps,
	InstallerState
> {
	render() {
		if (this.props.initialLoad) {
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
					</MessageWrapper>
				);
			}
		}

		const setupComplete = this.props.progress === ConnectionProgress.READY;
		const disabled = !setupComplete || this.props.working;

		return (
			<Wrapper>
				<ConnectionSetup
					working={this.props.working}
					refreshProgress={this.props.refreshProgress}
					progress={this.props.progress}
				/>
				<OverlaySetup disabled={disabled}>
					{!setupComplete ? (
						<FieldsetShield>
							<span>Deck Tracking setup required</span>
						</FieldsetShield>
					) : null}
				</OverlaySetup>
			</Wrapper>
		);
	}
}
