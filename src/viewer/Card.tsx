import * as React from "react";
import { Card as ComponentCard } from "react-hs-components";
import { CardsProps, withCards } from "../utils/cards";
import { getPlaceholder } from "./placeholders";

interface CardProps extends React.ClassAttributes<Card> {
	dbfId: number;
	x?: number;
	y?: number;
	width?: number;
	flipped?: boolean;
}

class Card extends React.Component<CardProps & CardsProps, {}> {
	render() {
		const card = this.props.cards.getByDbfId(this.props.dbfId);
		if (!card || !card.id) {
			return <div>Invalid card</div>;
		}

		const widthOverHeight = 512 / 764;

		const viewPortHeight = window.innerHeight;
		const vh = viewPortHeight / 100;
		const height = vh * 40;
		const width = height * widthOverHeight;

		const elementWidth = this.props.width || 0;

		const viewPortWidth = window.innerWidth;
		const flip =
			this.props.flipped ||
			(this.props.x || 0) + elementWidth / 2 + width > viewPortWidth;

		const x = this.props.x || 0;

		return (
			<ComponentCard
				id={card.id}
				style={{
					position: "absolute",
					height,
					top: this.props.y
						? Math.max(
								Math.min(this.props.y - height / 2, viewPortHeight - height),
								0,
							)
						: 0,
					left: !flip ? x + elementWidth / 2 : "unset",
					right: flip ? viewPortWidth - x + elementWidth / 2 : "unset",
					pointerEvents: "none",
				}}
				resolution={512}
				placeholder={getPlaceholder(card.type || "")}
			/>
		);
	}
}

export default withCards(Card);
