import * as React from "react";
import styled from "styled-components";
import OverlaySetup from "./OverlaySetup";
import ConnectionSetup from "./ConnectionSetup";

export const enum ConnectionProgress {
	UNKNOWN,
	CONNECT_ACCOUNT,
	INSTALL_TRACKER,
	READY,
	ERROR,
}

interface InstallerProps extends React.ClassAttributes<Installer> {
	progress: ConnectionProgress;
	refreshProgress: () => void;
	working?: boolean;
}

interface InstallerState {}

const InstallerDiv = styled.div`
	font-family: "Helvetica Neue", helvetica;
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	justify-content: center;
`;

export const Fieldset = styled.fieldset`
	padding: 25px;
	margin: 10px 10px 0 10px;
	width: 500px;
	background-color: #fbfbfb;
	border: solid 1px gray;
`;

export const Heading = styled.h1`
	margin-top: 0;
`;

export default class Installer extends React.Component<
	InstallerProps,
	InstallerState
> {
	render() {
		if (this.props.progress === ConnectionProgress.UNKNOWN) {
			if (this.props.working) {
				return <InstallerDiv>Loading...</InstallerDiv>;
			} else {
				return <InstallerDiv>Unable to connect :-(</InstallerDiv>;
			}
		}

		return (
			<InstallerDiv>
				<ConnectionSetup
					working={this.props.working}
					refreshProgress={this.props.refreshProgress}
					progress={this.props.progress}
				/>
				<OverlaySetup />
			</InstallerDiv>
		);
	}
}
