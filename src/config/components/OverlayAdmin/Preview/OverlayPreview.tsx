import * as React from "react";
import styled from "styled-components";
import { DecklistPosition } from "../../../../utils/config";
import { withProps } from "../../../../utils/styled";

const Stream = styled.div`
	position: relative;
	background-color: #ddd;
	border: 1px solid gray;
	width: 100%;
	height: auto;
	z-index: 5;
	overflow: hidden;

	&:after {
		display: block;
		content: "";
		padding-top: ${() => 100 / 16 * 9}%;
	}
`;

const OverlayElement = styled.div`
	background-color: #315376;
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

const BoardWrapper = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
	display: flex;
`;

const Center = withProps<{ top?: string; bottom?: string }>()(styled.div)`
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

const Hero = OverlayElement.extend`
	width: 7.5%;
	height: 100%;
	clip-path: polygon(
		0% 100%,
		0 40%,
		20% 10%,
		30% 3%,
		50% 0%,
		70% 3%,
		80% 10%,
		100% 40%,
		100% 100%
	);
	z-index: 50;
`;

interface OverlayPreviewProps {
	thumbnailUrl: string | null;
	position?: DecklistPosition;
	refreshStreamData: () => any;
}

export default class OverlayPreview extends React.Component<
	OverlayPreviewProps
> {
	private ref: HTMLDivElement | null;

	componentDidMount(): void {
		this.props.refreshStreamData();
	}

	render() {
		let thumbnailUrl = this.props.thumbnailUrl;
		if (thumbnailUrl !== null && this.ref) {
			thumbnailUrl = thumbnailUrl.replace(
				"{height}",
				"" + this.ref.clientHeight,
			);
			thumbnailUrl = thumbnailUrl.replace("{width}", "" + this.ref.clientWidth);
		} else {
			thumbnailUrl = null;
		}
		return (
			<Stream
				style={{
					backgroundImage:
						thumbnailUrl !== null ? `url(${thumbnailUrl})` : undefined,
					backgroundSize: "100%",
				}}
				innerRef={ref => (this.ref = ref)}
			>
				{this.props.position ? (
					<DeckList position={this.props.position} />
				) : null}
				<BoardWrapper>
					<Center top={`10.5%`}>
						<Hero />
					</Center>
					<Center top={`29.75%`}>
						<Minion />
						<Minion />
					</Center>
					<Center bottom={"37.6%"}>
						<Minion />
					</Center>
					<Center bottom={`16.5%`}>
						<Hero />
					</Center>
				</BoardWrapper>
			</Stream>
		);
	}
}
