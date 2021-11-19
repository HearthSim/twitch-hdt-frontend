import * as React from "react";
import { Card as ComponentCard } from "react-hs-components";
import {
	CardsProps,
	getHearthstoneLocaleFromTwitchLocale,
	withCards,
} from "../utils/cards";
import {
	TwitchExtConsumer,
	TwitchExtConsumerArgs,
	TwitchExtProps,
	withTwitchExt,
} from "../utils/twitch";
import { getPlaceholder } from "./placeholders";
import {
	TooltipBehaviour,
	TooltipConsumer,
	TooltipConsumerArgs,
} from "./utils/tooltips";

interface Props {
	dbfId: number;
	x?: number;
	y?: number;
	width?: number;
	flipped?: boolean;
	battlegrounds?: boolean;
}

class Card extends React.Component<Props & CardsProps & TwitchExtProps> {
	public render(): React.ReactNode {
		return (
			<TwitchExtConsumer>
				{({ query }: TwitchExtConsumerArgs) => (
					<TooltipConsumer>
						{({ behaviour }: TooltipConsumerArgs): React.ReactNode => {
							const card = this.props.cards.getByDbfId(this.props.dbfId);
							if (!card || !card.id) {
								return <div>Invalid card</div>;
							}

							let triple = false;
							if (this.props.battlegrounds) {
								if (
									card.battlegroundsNormalDbfId &&
									(!card.battlegroundsPremiumDbfId ||
										card.battlegroundsPremiumDbfId === card.dbfId)
								) {
									// This is a heuristic to determine whether to show a triple card. This is important
									// for cases where the golden DBF id has no non-golden render, because that just uses
									// the normalDbfId. In future we should actually just receive the triple value from HDT.
									triple = true;
								}
								if (!card || !card.id) {
									return <div>Invalid card</div>;
								}
							}

							const locale = getHearthstoneLocaleFromTwitchLocale(
								query.language || "en",
							);

							switch (behaviour) {
								case TooltipBehaviour.FULLSCREEN:
									return (
										<ComponentCard
											id={card.id}
											style={{
												position: "absolute",
												left: "50%",
												top: "50%",
												maxHeight: "100%",
												maxWidth: "100%",
												transform: "translateX(-50%) translateY(-50%)",
												pointerEvents: "none",
												touchAction: "none",
											}}
											resolution={512}
											locale={locale}
											placeholder={getPlaceholder(card.type || "")}
										/>
									);
								case TooltipBehaviour.ATTACHED:
								default: {
									const widthOverHeight = 512 / 764;

									const viewPortHeight = window.innerHeight;
									const vh = viewPortHeight / 100;
									const height = vh * 46.25;
									const width = height * widthOverHeight;

									const elementWidth = this.props.width || 0;

									const viewPortWidth = window.innerWidth;
									const flip =
										this.props.flipped ||
										(this.props.x || 0) + elementWidth / 2 + width >
											viewPortWidth;

									const x = this.props.x || 0;

									// Evade black gradients at top and bottom on Twitch
									let topMargin = 0;
									const bottomMargin = 40;
									if (
										this.props.twitchExtContext &&
										(this.props.twitchExtContext.isFullScreen ||
											this.props.twitchExtContext.isTheatreMode)
									) {
										topMargin = 50;
									}

									return (
										<ComponentCard
											id={card.id}
											style={{
												position: "absolute",
												height,
												top: this.props.y
													? Math.max(
															Math.min(
																this.props.y - height / 2,
																viewPortHeight - height - bottomMargin,
															),
															topMargin,
													  )
													: 0,
												left: !flip ? x + elementWidth / 2 : "unset",
												right: flip
													? viewPortWidth - x + elementWidth / 2
													: "unset",
												pointerEvents: "none",
											}}
											resolution={512}
											locale={locale}
											placeholder={getPlaceholder(card.type || "")}
											battlegrounds={this.props.battlegrounds}
											triple={triple}
										/>
									);
								}
							}
						}}
					</TooltipConsumer>
				)}
			</TwitchExtConsumer>
		);
	}
}

export default withCards(withTwitchExt(Card));
