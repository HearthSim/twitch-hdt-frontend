import * as React from "react";
import { CardTile as ComponentCardTile } from "react-hs-components";
import { EntityReference } from "../twitch-hdt";
import {
	CardsProps,
	resolveCard,
	splitEntity,
	withCards,
} from "../utils/cards";
import Entity from "./Entity";
import gift from "./gift.png";

interface Props {
	cardId: EntityReference;
	count?: number;
	gift?: boolean;
	showRarity?: boolean;
	tooltipDisabled?: boolean;
}

class CardTile extends React.Component<Props & CardsProps> {
	public render(): React.ReactNode {
		const { cardId, card } = resolveCard(
			this.props.cards,
			splitEntity(this.props.cardId).primary,
		);
		return (
			<Entity cardId={this.props.cardId} disabled={this.props.tooltipDisabled}>
				<ComponentCardTile
					id={cardId}
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
					animated={true}
					showRarity={this.props.showRarity}
					fontFamily={"sans-serif"}
					fontWeight={"bold"}
					hideStats={(card && (card.hideStats || card.hideCost)) || undefined}
				/>
			</Entity>
		);
	}
}

export default withCards(CardTile);
