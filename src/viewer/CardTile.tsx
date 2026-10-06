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
		const { primary } = splitEntity(this.props.cardId);
		const { cardId, card } = resolveCard(this.props.cards, primary);
		const unknown = !!primary && !card && this.props.cards.loaded;
		return (
			<Entity cardId={this.props.cardId} disabled={this.props.tooltipDisabled}>
				<ComponentCardTile
					id={cardId}
					name={card ? card.name || "Unknown Card" : unknown ? "???" : null}
					rarity={(card && card.rarity) || "COMMON"}
					// the cost is rendered as-is, so a string works despite the typing
					cost={card ? card.cost || 0 : unknown ? ("?" as any) : null}
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
