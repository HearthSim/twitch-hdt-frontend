import * as React from "react";
import styled from "styled-components";
import { DecklistPosition } from "../utils/config";
import { withProps } from "../utils/styled";

const Stream = styled.div`
	position: relative;
	background-color: #ddd;
	border: 1px solid gray;
	width: 100%;
	height: auto;

	&:after {
		display: block;
		content: "";
		padding-top: ${() => 100 / 16 * 9}%;
	}
`;

const OverlayElement = styled.div`
	background-color: #835944;
`;

const DeckList = withProps<{ position: DecklistPosition }>()(
	OverlayElement.extend,
)`
	${props =>
		props.position === DecklistPosition.TOP_LEFT ? "left" : "right"}: 5%;
	top: 10%;
	width: 15%;
	height: 60%;
	position: absolute;
`;

const Board = withProps<{ top?: string; bottom?: string }>()(styled.div)`
	position: absolute;
	display: flex;
	width: 100%;
	height: 15%;
	top: ${props => props.top || "unset"};
	bottom: ${props => props.bottom || "unset"};
	justify-content: center;
	text-align: center;
`;

const Minion = OverlayElement.extend`
	flex-grow: 0;
	width: 6.5%;
	height: 100%;
	margin: 0 0.51%;
	clip-path: ellipse(50% 50% at 50% 50%);
`;

interface StreamPreviewProps {
	position?: DecklistPosition;
}

export default class StreamPreview extends React.Component<
	StreamPreviewProps,
	{}
> {
	render() {
		return (
			<Stream>
				{this.props.position ? (
					<DeckList position={this.props.position} />
				) : null}
				<Board top={"29.75%"}>
					<Minion />
				</Board>
				<Board bottom={"37.6%"}>
					<Minion />
					<Minion />
				</Board>
			</Stream>
		);
	}
}
