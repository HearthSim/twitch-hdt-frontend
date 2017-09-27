import * as React from "react";
import { CardData } from "hearthstonejson";
import { CardsProps, withCards } from "../utils/cards";
import CardTile from "./CardTile";
import styled from "styled-components";
import { DecklistPosition } from "../config/configuration";
import { withProps } from "../utils/styled";

interface DeckListProps extends React.ClassAttributes<DeckList> {
	cardList: { [dbfId: number]: [number, number] };
	position: DecklistPosition;
	rarities?: boolean;
}

interface DeckListState {
	scale?: number;
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

const CardList = styled.ul`
	margin: 0;
	list-style-type: none;
	padding-left: 0;
	display: flex;
	flex-direction: column;

	// scaling
	transform-origin: top;
`;

class DeckList extends React.Component<
	DeckListProps & CardsProps,
	DeckListState
> {
	ref: HTMLDivElement;

	constructor(props: DeckListProps & CardsProps, context: any) {
		super(props, context);
		this.state = {
			scale: 1,
		};
	}

	onResize = (e: UIEvent) => {
		window.requestAnimationFrame(() => this.resize());
	};

	componentDidMount() {
		window.addEventListener("resize", this.onResize);
		this.resize();
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.onResize);
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
					{cards
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
