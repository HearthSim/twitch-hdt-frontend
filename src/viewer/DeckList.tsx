import * as React from "react";
import { encode } from "deckstrings";
import { CardData } from "hearthstonejson";
import { CardsProps, withCards } from "../utils/cards";
import CardTile from "./CardTile";
import styled from "styled-components";
import { DecklistPosition } from "../utils/config";
import { withProps } from "../utils/styled";
import { copy } from "clipboard-js";
import { BoardStateDeckCard } from "../twitch-hdt";
import { CopyDeckIcon, PinIcon, UnpinIcon } from "./icons";

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
}

interface DeckListState {
	scale?: number;
	copied?: boolean;
}

function cardSorting(a: CardData, b: CardData, direction = 1): number {
	if ((a.cost || 0) > (b.cost || 0)) {
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
		cursor: default;
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

const CardList = styled.ul`
	margin: 0;
	list-style-type: none;
	padding-left: 0;
	display: flex;
	flex-direction: column;

	// scaling
	transform-origin: top right;
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
	DeckListProps & CardsProps,
	DeckListState
> {
	copiedTimeout: number | null;
	ref: HTMLDivElement;

	constructor(props: DeckListProps & CardsProps, context?: any) {
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
			.reduce<
				[number, number][]
			>((result: [number, number][], card: [number, number]) => {
				result = result.slice(0);
				for (let i = 0; i < result.length; i++) {
					if (result[i][0] === card[0]) {
						result[i][1] += card[1];
						return result;
					}
				}
				// new card, append
				return result.concat([card]);
			}, []);
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
		const unsortedCards: Quad[] = this.props.cardList
			.map<NullableQuad>((card: Triplet): NullableQuad => {
				return [
					this.props.cards.getByDbfId(card[0] as number),
					card[0],
					card[1],
					card[2],
				];
			})
			.filter((x: NullableQuad) => !!x[0]) as Quad[];

		// sort using CardData
		unsortedCards.sort((a: Quad, b: Quad) => {
			return cardSorting(a[0], b[0]);
		});

		// shift CardData
		const cards: Triplet[] = unsortedCards.map((card: Quad): Triplet => {
			return [card[1], card[2], card[3]];
		});

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
				>
					<li>
						<Header>
							<h1>
								{this.state.copied ? "Copied!" : this.props.name || "Unnamed"}
							</h1>
							<CopyButton
								onClick={() => {
									copy(this.getDeckstring()).then(() => {
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
							>
								<img src={CopyDeckIcon} />
							</CopyButton>
							{this.props.pinned ? (
								<ShowButton
									onClick={() => {
										this.props.onPinned(false);
									}}
								>
									<img src={PinIcon} />
								</ShowButton>
							) : (
								<HideButton
									onClick={() => {
										this.props.onPinned(true);
									}}
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
										tooltipDisabled={this.props.hidden}
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
		const parent = this.ref.parentElement;
		const { height: ownHeight } = this.ref.getBoundingClientRect();
		const { height: boundsHeight } = parent.getBoundingClientRect();
		let scale = Math.min(boundsHeight / ownHeight, 1);
		if (scale === this.state.scale) {
			return;
		}
		this.setState({ scale });
	}

	componentDidUpdate(
		prevProps: DeckListProps & CardsProps,
		prevState: DeckListState,
	) {
		if (prevProps.cardList !== this.props.cardList) {
			return;
		}
		this.resize();
	}
}

export default withCards(DeckList);
