import clipboard from "clipboard-polyfill";
import { CardData } from "hearthstonejson-client";
import isEqual from "lodash.isequal";
import React from "react";
import styled from "styled-components";
import { BoardStateDeckCard, FormatType } from "../twitch-hdt";
import { CardsProps, withCards } from "../utils/cards";
import { DecklistPosition } from "../utils/config";
import { getCopiableDeck } from "../utils/hearthstone";
import { withProps } from "../utils/styled";
import { TwitchExtProps, withTwitchExt } from "../utils/twitch";
import CardTile from "./CardTile";
import { CopyDeckIcon, HSReplayNetIcon, PinIcon, UnpinIcon } from "./icons";

function cardSorting(
	a: CardData | null,
	b: CardData | null,
	direction = 1,
): number {
	if (a !== null && b !== null) {
		if ((a.cost || 0) > ((b && b.cost) || 0)) {
			return direction;
		}
		if ((a.cost || 0) < (b.cost || 0)) {
			return -direction;
		}
		if ((a.name || "") > (b.name || "")) {
			return direction;
		}
		if ((a.name || "") < (b.name || "")) {
			return -direction;
		}
	} else {
		if (a !== null && b === null) {
			return direction;
		}
		if (a === null && b !== null) {
			return -direction;
		}
	}
	return 0;
}

interface PositionProps {
	position: DecklistPosition;
}

interface OpacityProps {
	opacity?: number;
}

interface PaddingProps {
	padding?: string;
}

const Wrapper = withProps<PositionProps & OpacityProps>()(styled.div)`
	width: 240px;
	position: absolute;
	left: ${props =>
		props.position === DecklistPosition.TOP_LEFT ? "0.75vh" : "unset"};
	right: ${props =>
		props.position === DecklistPosition.TOP_RIGHT ? "0.75vh" : "unset"};

	opacity: ${(props: OpacityProps) =>
		typeof props.opacity === "number" ? props.opacity : 1};
	transition: opacity ${(props: OpacityProps) =>
		(props.opacity || 0) > 0.5 ? `0.25s ease-out` : `1.5s ease-in`};
`;

const Header = styled.header`
	width: 100%;
	text-align: center;
	color: white;
	background: #315376;
	height: 34px;

	display: flex;
	flex-direction: row;
	align-items: center;
	border: solid 1px black;

	&:hover {
		opacity: 1;
	}

	h1 {
		text-align: left;
		font-size: 0.8em;
		flex: 1 1 0;
		padding: 0 6px 0 6px;
		margin: 0;
		font-family: sans-serif;
		font-weight: bold;
		text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
			1px 1px 0 #000;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;

const HeaderButton = styled.button`
	color: white;
	height: 100%;
	width: 30px;
	flex: 0 0 auto;
	font-weight: bold;
	border-top: none;
	border-right: 1px solid transparent;
	border-bottom: none;
	border-left: 1px solid black;
	background-color: #315376;
	cursor: pointer;
	padding: 0;
	text-align: center;

	&:active,
	&:hover,
	&:focus {
		background-color: #1c2f42;
	}

	&:focus {
		outline: none;
	}
`;

const CopyButton = HeaderButton.extend`
	font-size: 1.1em;
	cursor: copy;
`;

const HideButton = HeaderButton.extend``;

const ShowButton = HeaderButton.extend``;

const CardList = withProps<{ moving?: boolean; left: boolean }>()(styled.ul)`
	margin: 0;
	list-style-type: none;
	padding-left: 0;
	display: flex;
	flex-direction: column;

	// movement
	cursor: ${props => (props.moving ? "grabbing" : "grab")};

	// scaling
	transform-origin: ${props => (props.left ? "top left" : "top right")};
`;

const CopyDeckButton = styled.button`
	width: 100%;
	font-weight: bold;
	color: white;
	padding: 5px 0;
	background-color: #3188b8;
	border: 1px solid #3188b8;

	&:hover {
		background-color: #2c79a4;
	}
`;

export const Icon = withProps<PaddingProps>()(styled.img)`
	height: 100%;
	padding: ${props => (props.padding ? props.padding : "7px 0")};
	filter: drop-shadow(-1px -1px 0 rgba(0, 0, 0, 0.5))
		drop-shadow(-1px 1px 0 rgba(0, 0, 0, 0.5))
		drop-shadow(1px -1px 0 rgba(0, 0, 0, 0.5))
		drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.5));
`;

interface Props {
	cardList: BoardStateDeckCard[];
	format: FormatType | null;
	hero: number | null;
	position: DecklistPosition;
	name?: string;
	showRarities?: boolean;
	pinned?: boolean;
	onPinned: (pinned: boolean) => void;
	hidden?: boolean;
	moving?: boolean;
	onMoveStart?: (e: React.MouseEvent<HTMLElement>) => void;
	onMoveEnd?: (e: React.MouseEvent<HTMLElement>) => void;
}

interface State {
	scale?: number;
	copied?: boolean;
}

class DeckList extends React.Component<
	Props & CardsProps & TwitchExtProps,
	State
> {
	public copiedTimeout: number | null = null;
	public ref: HTMLDivElement | null = null;

	constructor(props: Props & CardsProps & TwitchExtProps, context: any) {
		super(props, context);
		this.state = {
			scale: 1,
			copied: false,
		};
	}

	public onResize = (e: UIEvent) => {
		window.requestAnimationFrame(() => this.resize());
	};

	public clearTimeout() {
		if (!this.copiedTimeout) {
			return;
		}
		window.clearTimeout(this.copiedTimeout);
		this.copiedTimeout = null;
	}

	public componentDidMount() {
		window.addEventListener("resize", this.onResize);
		this.resize();
	}

	public componentWillUnmount() {
		window.removeEventListener("resize", this.onResize);
		this.clearTimeout();
	}

	public shouldComponentUpdate(
		nextProps: Readonly<Props & CardsProps & TwitchExtProps>,
		nextState: Readonly<State>,
		nextContext: any,
	): boolean {
		if (
			nextState.scale !== this.state.scale ||
			nextState.copied !== this.state.copied
		) {
			return true;
		}
		if (
			this.didPlayerLayoutChange(
				this.props.twitchExtContext,
				nextProps.twitchExtContext,
			)
		) {
			return true;
		}
		return (
			nextProps.cards !== this.props.cards ||
			!isEqual(nextProps.cardList, this.props.cardList) ||
			nextProps.position !== this.props.position ||
			nextProps.name !== this.props.name ||
			nextProps.hero !== this.props.hero ||
			nextProps.format !== this.props.format ||
			nextProps.showRarities !== this.props.showRarities ||
			nextProps.pinned !== this.props.pinned ||
			nextProps.onPinned !== this.props.onPinned ||
			nextProps.hidden !== this.props.hidden ||
			nextProps.moving !== this.props.moving ||
			nextProps.onMoveStart !== this.props.onMoveStart ||
			nextProps.onMoveEnd !== this.props.onMoveEnd
		);
	}

	public stopPropagation(e: { stopPropagation: () => void }) {
		e.stopPropagation();
	}

	public render(): React.ReactNode {
		let position = this.props.position;
		if (
			[DecklistPosition.TOP_LEFT, DecklistPosition.TOP_RIGHT].indexOf(
				position,
			) === -1
		) {
			position = DecklistPosition.TOP_RIGHT;
		}

		type Triplet = [number, number, number];
		type NullableQuad = [CardData | null, number, number, number];

		// prepend CardData
		const unsortedCards: NullableQuad[] = this.props.cardList.map<NullableQuad>(
			(card: Triplet): NullableQuad => {
				return [
					this.props.cards.getByDbfId(card[0] as number),
					card[0],
					card[1],
					card[2],
				];
			},
		);

		// sort using CardData
		unsortedCards.sort((a: NullableQuad, b: NullableQuad) => {
			return cardSorting(a[0], b[0]);
		});

		// shift CardData
		const cards: Triplet[] = unsortedCards.map(
			(card: NullableQuad): Triplet => {
				return [card[1], card[2], card[3]];
			},
		);

		const useDeckName =
			typeof this.props.name === "string" && this.props.name.trim().length > 0;

		return (
			<Wrapper
				position={position}
				opacity={this.props.hidden ? 0 : this.props.pinned ? 1 : 0.85}
				innerRef={ref => (this.ref = ref)}
			>
				<CardList
					style={{
						transform: `scale(${this.state.scale || 1})`,
					}}
					onMouseDown={e => {
						this.props.onMoveStart && this.props.onMoveStart(e);
					}}
					onMouseUp={e => {
						this.props.onMoveEnd && this.props.onMoveEnd(e);
					}}
					moving={this.props.moving}
					left={this.props.position === "topleft"}
				>
					<li>
						<Header>
							<Icon
								src={HSReplayNetIcon}
								padding="4px"
								title="Powered by HSReplay.net"
							/>
							<h1 title={useDeckName ? this.props.name : "Unnamed Deck"}>
								{this.state.copied
									? "Copied!"
									: useDeckName ? this.props.name : "HSReplay.net"}
							</h1>
							<CopyButton
								onClick={() => {
									if (this.props.format === null || this.props.hero === null) {
										return;
									}
									const toCopy = getCopiableDeck(
										this.props.cardList,
										this.props.format,
										[this.props.hero],
										this.props.name,
									);
									clipboard.writeText(toCopy).then(() => {
										this.setState({ copied: true }, () => {
											this.clearTimeout();
											this.copiedTimeout = window.setTimeout(() => {
												this.setState({ copied: false });
											}, 3000);
										});
									});
									const target = document.activeElement as HTMLElement;
									if (target && typeof target.blur === "function") {
										target.blur();
									}
								}}
								onMouseDown={this.stopPropagation}
								title="Copy deck to clipboard"
							>
								<Icon src={CopyDeckIcon} />
							</CopyButton>
							{this.props.pinned ? (
								<ShowButton
									onClick={() => {
										this.props.onPinned(false);
									}}
									onMouseDown={this.stopPropagation}
									title="Automatically hide deck list"
								>
									<Icon src={PinIcon} />
								</ShowButton>
							) : (
								<HideButton
									onClick={() => {
										this.props.onPinned(true);
									}}
									onMouseDown={this.stopPropagation}
									title="Keep deck list visible"
								>
									<Icon src={UnpinIcon} />
								</HideButton>
							)}
						</Header>
					</li>
					{cards
						.map((card: Triplet, index: number) => {
							const [dbfId, current, initial] = card;
							return (
								<li key={index}>
									<CardTile
										dbfId={dbfId}
										count={current}
										showRarity={this.props.showRarities}
										gift={initial === 0}
										tooltipDisabled={this.props.hidden || this.props.moving}
									/>
								</li>
							);
						})
						.filter(x => !!x)}
				</CardList>
			</Wrapper>
		);
	}

	public resize() {
		if (!this.ref || !this.ref.parentElement) {
			return;
		}
		if (this.props.moving) {
			return;
		}
		const parent = this.ref.parentElement;
		const { height: ownHeight } = this.ref.getBoundingClientRect();
		const { height: boundsHeight } = parent.getBoundingClientRect();
		const scale = Math.min(boundsHeight / ownHeight, 1);
		if (scale === this.state.scale) {
			return;
		}
		this.setState({ scale });
	}

	public didPlayerLayoutChange(
		contextA?: TwitchExtContext,
		contextB?: TwitchExtContext,
	): boolean {
		if (!contextA || !contextB) {
			return false;
		}
		return (
			contextA.isTheatreMode !== contextB.isTheatreMode ||
			contextA.isFullScreen !== contextB.isFullScreen
		);
	}

	public componentDidUpdate(
		prevProps: Readonly<Props & CardsProps & TwitchExtProps>,
		prevState: Readonly<State>,
		prevContext: any,
	): void {
		if (
			isEqual(prevProps.cardList, this.props.cardList) &&
			!this.didPlayerLayoutChange(
				prevProps.twitchExtContext,
				this.props.twitchExtContext,
			)
		) {
			return;
		}
		this.resize();
	}
}

export default withTwitchExt(withCards(DeckList));
