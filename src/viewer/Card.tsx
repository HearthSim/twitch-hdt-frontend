import * as React from "react";
import { Card as ComponentCard } from "react-hs-components";
import { CardsProps, withCards } from "../utils/cards";
import { getPlaceholder } from "./placeholders";

interface CardProps extends React.ClassAttributes<Card> {
	dbfId: number;
	x?: number;
	y?: number;
}

class Card extends React.Component<CardProps & CardsProps, {}> {
	render() {
		const card = this.props.cards.getByDbfId(this.props.dbfId);
		if (!card || !card.id) {
			return <div>Invalid card</div>;
		}
		return (
			<ComponentCard
				id={card.id}
				style={{
					position: "absolute",
					height: "40vh",
					top: this.props.y ? `calc(${this.props.y}px - 7.5vh - 20vh)` : 0,
					left: this.props.x || 0,
					pointerEvents: "none",
				}}
				resolution={512}
				placeholder={getPlaceholder(card.type || "")}
			/>
		);
	}
}

export default withCards(Card);
