import * as React from "react";
import { CardTile as ComponentCardTile } from "react-hs-components";
import { CardsProps, withCards } from "../utils/cards";
import Entity from "./Entity";
import gift from "./gift.png";

interface CardTileProps extends React.ClassAttributes<Card> {
	dbfId: number;
	count?: number;
	gift?: boolean;
	noRarity?: boolean;
}

class Card extends React.Component<CardTileProps & CardsProps, {}> {
	render() {
		const card = this.props.cards.getByDbfId(this.props.dbfId);
		if (!card || !card.id) {
			return <div>Invalid card</div>;
		}
		return (
			<Entity dbfId={this.props.dbfId}>
				<ComponentCardTile
					id={card.id}
					name={card.name || ""}
					rarity={this.props.noRarity ? undefined : card.rarity || "COMMON"}
					cost={card.cost || 0}
					number={
						this.props.count && this.props.count > 1
							? this.props.count
							: undefined
					}
					icon={this.props.gift ? gift : undefined}
					disabled={this.props.count === 0}
					fontFamily={"sans-serif"}
					fontWeight={"bold"}
				/>
			</Entity>
		);
	}
}

export default withCards(Card);
