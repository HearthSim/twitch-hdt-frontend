import * as React from "react";
import { encode } from "deckstrings";
import { CardData } from "hearthstonejson";
import { CardsProps, withCards } from "../utils/cards";
import CardTile from "./CardTile";
import styled from "styled-components";
import { DecklistPosition } from "../config/configuration";
import { withProps } from "../utils/styled";
import { copy } from "clipboard-js";

interface DeckListProps extends React.ClassAttributes<DeckList> {
	cardList: { [dbfId: number]: [number, number] };
	position: DecklistPosition;
	name?: string;
	hero?: number;
	format?: number;
	rarities?: boolean;
}

interface DeckListState {
	scale?: number;
	copied?: boolean;
	hidden?: boolean;
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

const Wrapper = withProps<PositionProps>()(styled.div)`
	width: 25vh;
	max-width: 240px;
	position: absolute;
	left: ${props =>
		props.position === DecklistPosition.TOP_LEFT ? "0.75vh" : "unset"};
	right: ${props =>
		props.position === DecklistPosition.TOP_RIGHT ? "0.75vh" : "unset"};
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

	h1 {
		cursor: default;
		font-size: 0.8em;
		flex: 1 1 0;
		padding: 2px 6px 0 6px;
		margin: 0;
		font-family: "Chunkfive", sans-serif;
		font-weight: normal;
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
	&:hover {
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

const HideButton = HeaderButton.extend`
	font-size: 1.5em;
`;

const ShowButton = HeaderButton.extend``;

const CardList = styled.ul`
	margin: 0;
	list-style-type: none;
	padding-left: 0;
	display: flex;
	flex-direction: column;

	// scaling
	transform-origin: top;
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

	constructor(props: DeckListProps & CardsProps, context: any) {
		super(props, context);
		this.state = {
			scale: 1,
			copied: false,
			hidden: false,
		};
	}

	onResize = (e: UIEvent) => {
		window.requestAnimationFrame(() => this.resize());
	};

	getDeckstring(): string {
		const initialCards = Object.keys(this.props.cardList)
			.map(Number)
			.map((dbfId: number, index: number) => {
				const [_, initial] = this.props.cardList[dbfId];
				return [dbfId, initial];
			});
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
		const dbfIds = Object.keys(this.props.cardList).map(Number);
		const cards = dbfIds
			.map(dbfId => this.props.cards.getByDbfId(dbfId))
			.filter(x => !!x) as CardData[];
		cards.sort(cardSorting);

		let scaleY = this.state.scale || 1;
		let scaleX = 1;

		if (scaleY < 0.9) {
			scaleX -= Math.pow(0.9 - scaleY, 2);
		}

		return (
			<Wrapper
				position={this.props.position}
				innerRef={ref => (this.ref = ref)}
			>
				<CardList
					style={{
						transform: `scale(${scaleX}, ${scaleY})`,
					}}
				>
					<li>
						<Header>
							<h1>{this.state.copied ? "Copied!" : this.props.name}</h1>
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
								}}
							>
								✂
							</CopyButton>
							{this.state.hidden ? (
								<ShowButton
									onClick={() => {
										this.setState({ hidden: false });
									}}
								>
									➕
								</ShowButton>
							) : (
								<HideButton
									onClick={() => {
										this.setState({ hidden: true });
									}}
								>
									×
								</HideButton>
							)}
						</Header>
					</li>
					{!this.state.hidden
						? cards
								.map((card: CardData, index: number) => {
									const dbfId = (card as any).dbfId;
									const [current, initial] = this.props.cardList[dbfId];
									return (
										<li key={index}>
											<CardTile
												dbfId={dbfId}
												count={current}
												noRarity={!this.props.rarities}
												gift={initial === 0}
											/>
										</li>
									);
								})
								.filter(x => !!x)
						: null}
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
