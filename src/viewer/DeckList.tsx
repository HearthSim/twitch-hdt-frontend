import * as React from "react";
import { encode } from "deckstrings";
import { CardData } from "hearthstonejson";
import { CardsProps, withCards } from "../utils/cards";
import CardTile from "./CardTile";
import styled from "styled-components";
import { DecklistPosition } from "../utils/config";
import { withProps } from "../utils/styled";
import clipboard from "clipboard-polyfill";
import { BoardStateDeckCard } from "../twitch-hdt";
import { CopyDeckIcon, PinIcon, UnpinIcon } from "./icons";
import { TwitchExtProps, withTwitchExt } from "../utils/twitch";

const isEqual = require("lodash.isequal"); // see https://github.com/Microsoft/TypeScript/issues/5073

interface DeckListProps extends React.ClassAttributes<DeckList> {
	cardList: BoardStateDeckCard[];
	position: DecklistPosition;
	name?: string;
	hero?: number;
	format?: number;
	showRarities?: boolean;
	pinned?: boolean;
	onPinned: (pinned: boolean) => void;
	hidden?: boolean;
	moving?: boolean;
	onMoveStart?: (e: React.MouseEvent<HTMLElement>) => void;
	onMoveEnd?: (e: React.MouseEvent<HTMLElement>) => void;
}

interface DeckListState {
	scale?: number;
	copied?: boolean;
}

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
	border-right: none;
	border-bottom: none;
	border-left: 1px solid black;
	background-color: #315376;
	cursor: pointer;

	&:active,
	&:hover,
	&:focus {
		background-color: #1c2f42;
	}

	&:focus {
		outline: none;
	}

	img {
		position: relative;
		top: -1px;
		vertical-align: middle;
		filter: invert(100%);
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

class DeckList extends React.Component<
	DeckListProps & CardsProps & TwitchExtProps,
	DeckListState
> {
	copiedTimeout: number | null;
	ref: HTMLDivElement;

	constructor(
		props: DeckListProps & CardsProps & TwitchExtProps,
		context?: any,
	) {
		super(props, context);
		this.state = {
			scale: 1,
			copied: false,
		};
	}

	onResize = (e: UIEvent) => {
		window.requestAnimationFrame(() => this.resize());
	};

	getDeckstring(): string {
		const initialCards: [number, number][] = this.props.cardList
			.filter((card: BoardStateDeckCard) => {
				const [dbfId, current, initial] = card;
				return !!initial;
			})
			.map<[number, number]>((card: BoardStateDeckCard) => {
				const [dbfId, current, initial] = card;
				return [dbfId, initial];
			})
			.reduce<[number, number][]>(
				(result: [number, number][], card: [number, number]) => {
					result = result.slice(0);
					for (let i = 0; i < result.length; i++) {
						if (result[i][0] === card[0]) {
							result[i][1] += card[1];
							return result;
						}
					}
					// new card, append
					return result.concat([card]);
				},
				[],
			);
		const deckDescription = {
			cards: initialCards,
			heroes: [this.props.hero],
			format: this.props.format,
		};

		let deckstring = null;
		try {
			deckstring = encode(deckDescription);
		} catch (e) {
			console.error(e);
			return "";
		}

		if (deckstring === null) {
			return "";
		}

		const isStandard = this.props.format === 2;

		return [
			...(this.props.name ? [`### ${this.props.name}`] : []),
			...(this.props.format
				? [`# Format: ${isStandard ? "Standard" : "Wild"}`]
				: []),
			...(isStandard ? ["# Year of the Mammoth"] : []),
			"#",
			deckstring,
			"#",
			"# To use this deck, copy it to your clipboard and create a new deck in Hearthstone",
		].join("\n");
	}

	clearTimeout() {
		if (!this.copiedTimeout) {
			return;
		}
		window.clearTimeout(this.copiedTimeout);
		this.copiedTimeout = null;
	}

	componentDidMount() {
		window.addEventListener("resize", this.onResize);
		this.resize();
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.onResize);
		this.clearTimeout();
	}

	shouldComponentUpdate(
		nextProps: Readonly<DeckListProps & CardsProps & TwitchExtProps>,
		nextState: Readonly<DeckListState>,
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

	stopPropagation(e: { stopPropagation: () => void }) {
		e.stopPropagation();
	}

	render() {
		let position = this.props.position;
		if (
			[DecklistPosition.TOP_LEFT, DecklistPosition.TOP_RIGHT].indexOf(
				position,
			) === -1
		) {
			position = DecklistPosition.TOP_RIGHT;
		}

		type Triplet = [number, number, number];
		type Quad = [CardData, number, number, number];
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
		//.filter((x: NullableQuad) => !!x[0]) as Quad[];

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
							<h1>
								{this.state.copied ? "Copied!" : this.props.name || "Unnamed"}
							</h1>
							<CopyButton
								onClick={() => {
									clipboard.writeText(this.getDeckstring()).then(() => {
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
								<img src={CopyDeckIcon} />
							</CopyButton>
							{this.props.pinned ? (
								<ShowButton
									onClick={() => {
										this.props.onPinned(false);
									}}
									onMouseDown={this.stopPropagation}
									title="Automatically hide deck list"
								>
									<img src={PinIcon} />
								</ShowButton>
							) : (
								<HideButton
									onClick={() => {
										this.props.onPinned(true);
									}}
									onMouseDown={this.stopPropagation}
									title="Keep deck list visible"
								>
									<img src={UnpinIcon} />
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

	resize() {
		if (!this.ref || !this.ref.parentElement) {
			return;
		}
		if (this.props.moving) {
			return;
		}
		const parent = this.ref.parentElement;
		const { height: ownHeight } = this.ref.getBoundingClientRect();
		const { height: boundsHeight } = parent.getBoundingClientRect();
		let scale = Math.min(boundsHeight / ownHeight, 1);
		if (scale === this.state.scale) {
			return;
		}
		this.setState({ scale });
	}

	didPlayerLayoutChange(
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

	componentDidUpdate(
		prevProps: DeckListProps & CardsProps & TwitchExtProps,
		prevState: DeckListState,
	) {
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
