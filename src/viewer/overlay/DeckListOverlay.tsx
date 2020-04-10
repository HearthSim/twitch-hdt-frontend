import React from "react";
import styled from "styled-components";
import { BoardStateDeck } from "../../twitch-hdt";
import { DecklistPosition } from "../../utils/config";
import { TwitchExtProps, withTwitchExt } from "../../utils/twitch";
import DeckList from "./DeckList";
import { PositionProps } from "./Overlay";

const Wrapper = styled.div<{ active?: boolean }>`
	z-index: 100;
	position: absolute;
	height: 100vh;
	width: 100vw;
	overflow: hidden;
	pointer-events: ${props => (props.active ? "all" : "none")};
`;

const DeckListBounds = styled.div<PositionProps>`
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
			movePreviewOffset: null,
			moveStartPosition: null,
			moving: false,
			viewerOffset: null,
		};
	}

	public onMoveStart = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		const { clientX, clientY } = e;
		this.setState({
			moveStartPosition: { x: clientX, y: clientY },
			moving: true,
		});
	};

	public onMove = (e: React.MouseEvent<HTMLElement>) => {
		if (!this.state.moving) {
			return;
		}
		const { clientX, clientY } = e;
		if (!this.state.moveStartPosition) {
			return;
		}
		const offsetX = clientX - this.state.moveStartPosition.x;
		const offsetY = clientY - this.state.moveStartPosition.y;
		this.setState({
			movePreviewOffset: {
				x: offsetX,
				y: offsetY,
			},
		});
	};

	public onMoveEnd = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		if (!this.state.moving) {
			return;
		}
		this.setState(state => ({
			movePreviewOffset: null,
			moving: false,
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

	public onPinned = (pinned: boolean) => this.props.onPinDeck(pinned);

	public componentDidUpdate(
		prevProps: Readonly<Props & TwitchExtProps>,
		prevState: Readonly<State>,
		prevContext: any,
	): void {
		if (prevProps.position !== this.props.position) {
			this.setState({
				movePreviewOffset: null,
				moveStartPosition: null,
				moving: false,
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
						format={deck && deck.format ? deck.format : null}
						hero={deck && deck.hero ? deck.hero : null}
						name={deck && deck.name}
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
