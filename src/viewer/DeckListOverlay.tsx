import * as React from "react";
import styled from "styled-components";
import { DecklistPosition } from "../utils/config";
import { BoardStateDeck } from "../twitch-hdt";
import { TwitchExtProps, withTwitchExt } from "../utils/twitch";
import { withProps } from "../utils/styled";
import { PositionProps } from "./Overlay";
import DeckList from "./DeckList";

const Wrapper = withProps<{ active?: boolean }>()(styled.div)`
	z-index: 100;
	position: absolute;
	height: 100vh;
	width: 100vw;
	overflow: hidden;
	pointer-events: ${props => (props.active ? "all" : "none")};
`;

const DeckListBounds = withProps<PositionProps>()(styled.div)`
	position: absolute;
	top: ${props => props.top || "100px"};
	width: 100vw;
	height: calc(100vh - ${props => props.top || "100px"} - 80px);
	overflow: visible;
	pointer-events: none;

	> * > * {
		pointer-events: all;
	}
`;

interface Vector {
	x: number;
	y: number;
}

interface Props {
	deck?: BoardStateDeck;
	position: DecklistPosition;
	pinDeck: boolean;
	onPinDeck: (pinDeck: boolean) => void;
	engaged?: boolean;
	hidden?: boolean;
}

interface State {
	moving?: boolean;
	moveStartPosition?: Vector | null;
	movePreviewOffset?: Vector | null;
	viewerOffset?: Vector | null;
}

class DeckListOverlay extends React.Component<Props & TwitchExtProps, State> {
	constructor(props: Props & TwitchExtProps, context: any) {
		super(props, context);
		this.state = {
			moving: false,
			moveStartPosition: null,
			movePreviewOffset: null,
			viewerOffset: null,
		};
	}

	onMoveStart = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		const { clientX, clientY } = e;
		this.setState({
			moving: true,
			moveStartPosition: { x: clientX, y: clientY },
		});
	};

	onMove = (e: React.MouseEvent<HTMLElement>) => {
		if (!this.state.moving) {
			return;
		}
		const { clientX, clientY } = e;
		if (!this.state.moveStartPosition) {
			return;
		}
		const target = e.target as HTMLElement;
		const { top, left } = target.getBoundingClientRect();
		const offsetX = clientX - this.state.moveStartPosition.x;
		const offsetY = clientY - this.state.moveStartPosition.y;
		this.setState({
			movePreviewOffset: {
				x: offsetX,
				y: offsetY,
			},
		});
	};

	onMoveEnd = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		if (!this.state.moving) {
			return;
		}
		this.setState(state => ({
			moving: false,
			movePreviewOffset: null,
			viewerOffset: state.viewerOffset
				? state.movePreviewOffset
					? {
							x: state.movePreviewOffset.x + state.viewerOffset.x,
							y: state.movePreviewOffset.y + state.viewerOffset.y,
						}
					: state.viewerOffset
				: state.movePreviewOffset,
		}));
	};

	onPinned = (pinned: boolean) => this.props.onPinDeck(pinned);

	componentDidUpdate(
		prevProps: Readonly<Props & TwitchExtProps>,
		prevState: Readonly<State>,
		prevContext: any,
	): void {
		if (prevProps.position !== this.props.position) {
			this.setState({
				moving: false,
				moveStartPosition: null,
				movePreviewOffset: null,
				viewerOffset: null,
			});
		}
	}

	public render(): React.ReactNode {
		if (this.props.hidden) {
			return null;
		}

		const deck = this.props.deck;

		return (
			<Wrapper
				active={this.state.moving}
				onMouseMove={this.onMove}
				onMouseUp={this.onMoveEnd}
			>
				<DeckListBounds
					top={
						this.props.twitchExtContext &&
						(this.props.twitchExtContext.isFullScreen ||
							this.props.twitchExtContext.isTheatreMode)
							? "100px"
							: "50px"
					}
					style={{
						marginLeft: `${(this.state.viewerOffset
							? this.state.viewerOffset.x
							: 0) +
							(this.state.movePreviewOffset
								? this.state.movePreviewOffset.x
								: 0)}px`,
						marginTop: `${(this.state.viewerOffset
							? this.state.viewerOffset.y
							: 0) +
							(this.state.movePreviewOffset
								? this.state.movePreviewOffset.y
								: 0)}px`,
					}}
				>
					<DeckList
						cardList={deck && Array.isArray(deck.cards) ? deck.cards : []}
						name={deck && deck.name}
						hero={deck && deck.hero}
						format={deck && deck.format}
						showRarities={false}
						position={this.props.position}
						pinned={this.props.pinDeck}
						onPinned={this.onPinned}
						hidden={!this.props.pinDeck && !this.props.engaged}
						moving={this.state.moving}
						onMoveStart={this.onMoveStart}
						onMoveEnd={this.onMoveEnd}
					/>
				</DeckListBounds>
			</Wrapper>
		);
	}
}

export default withTwitchExt(DeckListOverlay);
