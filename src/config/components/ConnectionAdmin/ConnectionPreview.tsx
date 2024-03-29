import * as React from "react";
import styled from "styled-components";

const Wrapper = styled.ol`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	list-style-type: none;
	background-color: #eee;
	border: 1px solid gray;
	width: 100%;
	text-align: center;
	padding: 25px 0;

	* {
		white-space: nowrap;
	}
`;

interface ConnectedProps {
	connected: boolean | null;
}

const getElementColor = (props: ConnectedProps) => {
	return props.connected === null ? "#bbb" : "black";
};

const getConnectionColor = (props: ConnectedProps) => {
	if (props.connected === null) {
		return "#bbb";
	}
	return props.connected ? "black" : "red";
};

const Element = styled.li<ConnectedProps>`
	font-weight: normal;
	padding: 10px 16px;
	border: 1px solid black;
	//margin: 0 1em;
	color: ${(props) =>
		props.connected === null ? getElementColor(props) : "unset"};
	border-color: ${(props) =>
		props.connected === null ? getElementColor(props) : "unset"};
`;

const Connection = styled.li<ConnectedProps>`
	font-family: monospace;
	color: ${(props) => getConnectionColor(props)};
`;

interface Props {
	working?: boolean;
	twitch: boolean | null;
	tracker: boolean | null;
}

export default class HSReplayNetConnection extends React.Component<Props> {
	public render(): React.ReactNode {
		return (
			<Wrapper>
				<Element connected={true}>Twitch</Element>
				<Connection connected={this.props.working ? null : this.props.twitch}>
					{this.renderConnection(this.props.twitch)}
				</Connection>
				<Element connected={this.props.working ? null : this.props.twitch}>
					HSReplay.net
				</Element>
				<Connection
					connected={
						this.props.working
							? null
							: this.props.twitch
							? this.props.tracker
							: null
					}
				>
					{this.renderConnection(this.props.tracker)}
				</Connection>
				<Element
					connected={
						this.props.twitch && !this.props.working ? this.props.tracker : null
					}
				>
					HDT
				</Element>
			</Wrapper>
		);
	}

	private renderConnection(connected: boolean | null): React.ReactNode {
		return connected ? "────────" : "───┘┌───";
	}
}
