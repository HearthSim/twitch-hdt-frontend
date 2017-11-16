import * as React from "react";
import { CardTile as ComponentCardTile } from "react-hs-components";
import { CardDefinition, CardsProps, withCards } from "../utils/cards";
import Entity from "./Entity";
import gift from "./gift.png";

interface CardTileProps extends React.ClassAttributes<CardTile> {
	dbfId: number;
	count?: number;
	gift?: boolean;
	showRarity?: boolean;
	tooltipDisabled?: boolean;
}

class CardTile extends React.Component<CardTileProps & CardsProps> {
	render() {
		const card = this.props.cards.getByDbfId(this.props.dbfId);
		return (
			<Entity dbfId={this.props.dbfId} disabled={this.props.tooltipDisabled}>
				<ComponentCardTile
					id={card ? card.id || null : null}
					name={card ? card.name || "Unknown Card" : null}
					rarity={(card && card.rarity) || "COMMON"}
					cost={card ? card.cost || 0 : null}
					number={
						this.props.count && this.props.count > 1
							? this.props.count
							: undefined
					}
					icon={this.props.gift ? gift : undefined}
					disabled={this.props.count === 0}
					animated
					showRarity={this.props.showRarity}
					fontFamily={"sans-serif"}
					fontWeight={"bold"}
				/>
			</Entity>
		);
	}
}

export default withCards(CardTile);
