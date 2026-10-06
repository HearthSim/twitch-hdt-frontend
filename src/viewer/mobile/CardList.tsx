import { CardData } from "hearthstonejson-client";
import * as React from "react";
import styled from "styled-components";
import {
	BoardStateDeckCard,
	CardReference,
	FormatType,
} from "../../twitch-hdt";
import {
	CardsProps,
	resolveCard,
	sort as cardSorting,
	withCards,
} from "../../utils/cards";
import CardTile from "../CardTile";

const CardListList = styled.ul`
	margin: 0;
	list-style-type: none;
	padding-left: 0;
	display: flex;
	flex-direction: column;
	height: 100%;
`;

interface Props {
	cardList: BoardStateDeckCard[];
	name?: string;
	hero?: number;
	format?: FormatType;
}

class CardList extends React.Component<Props & CardsProps> {
	constructor(props: Props & CardsProps, context: any) {
		super(props, context);
	}

	public render(): React.ReactNode {
		type Triplet = [CardReference, number, number];
		type NullableQuad = [CardData | null, CardReference, number, number];

		// prepend CardData
		const unsortedCards: NullableQuad[] = this.props.cardList.map<NullableQuad>(
			(card: Triplet): NullableQuad => {
				return [
					resolveCard(this.props.cards, card[0]).card,
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
			<CardListList>
				{cards
					.map((card: Triplet, index: number) => {
						const [dbfId, current, initial] = card;
						return (
							<li key={index}>
								<CardTile
									cardId={dbfId}
									count={current}
									showRarity={true}
									gift={initial === 0}
								/>
							</li>
						);
					})
					.filter((x) => !!x)}
			</CardListList>
		);
	}
}

export default withCards(CardList);
