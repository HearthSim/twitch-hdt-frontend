import * as React from "react";
import styled from "styled-components";
import { EBSConfiguration } from "../../../../twitch-hdt";
import { Feature, hasFeature, OverlayPosition } from "../../../../utils/config";

const Stream = styled.div`
	position: relative;
	background-color: none;
	border: 1px solid ${(props) => props.theme.textColor};
	width: 100%;
	height: auto;
	z-index: 5;
	overflow: hidden;

	&:after {
		display: block;
		content: "";
		padding-top: ${() => (100 / 16) * 9}%;
	}
`;

const OverlayElement = styled.div`
	background-color: ${(props) => props.theme.accent};
`;

const DeckList = styled(OverlayElement)<{ position: OverlayPosition }>`
	${(props) =>
		props.position === OverlayPosition.TOP_LEFT ? "left: 2%" : "right: 5%"};
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

const Centered = styled.div<{ top?: string; bottom?: string }>`
	position: absolute;
	display: flex;
	width: 100%;
	height: 15%;
	top: ${(props) => props.top || "unset"};
	bottom: ${(props) => props.bottom || "unset"};
	justify-content: center;
	text-align: center;
`;

const Minion = styled(OverlayElement)`
	flex-grow: 0;
	width: 6.5%;
	height: 100%;
	margin: 0 0.51%;
	clip-path: ellipse(50% 50% at 50% 50%);
`;

const Hero = styled(OverlayElement)`
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
	settings: EBSConfiguration | null;
	isLive: boolean | null;
	thumbnailUrl: string | null;
	hideTooltips?: boolean;
}

export default class OverlayPreview extends React.Component<OverlayPreviewProps> {
	private ref: HTMLDivElement | null = null;

	public render(): React.ReactNode {
		let thumbnailUrl = this.props.thumbnailUrl;
		if (thumbnailUrl !== null && this.ref && this.props.isLive) {
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
				ref={(ref) => (this.ref = ref)}
			>
				{this.props.settings &&
				!hasFeature(+(this.props.settings.hidden || 0), Feature.DECKLIST) ? (
					<DeckList
						position={this.props.settings.deck_position as OverlayPosition}
					/>
				) : null}
				{this.props.settings &&
				!hasFeature(+(this.props.settings.hidden || 0), Feature.TOOLTIPS) ? (
					<BoardWrapper
						style={{
							left: `${+(this.props.settings &&
							this.props.settings.game_offset_horizontal
								? this.props.settings.game_offset_horizontal
								: 0)}%`,
						}}
					>
						<Centered top={`10.5%`}>
							<Hero />
						</Centered>
						<Centered top={`29.75%`}>
							<Minion />
						</Centered>
						<Centered bottom={"37.6%"}>
							<Minion />
							<Minion />
						</Centered>
						<Centered bottom={`16.5%`}>
							<Hero />
						</Centered>
					</BoardWrapper>
				) : null}
			</Stream>
		);
	}
}
