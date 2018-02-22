import * as React from "react";
import { Card as ComponentCard } from "react-hs-components";
import { CardsProps, withCards } from "../utils/cards";
import { getPlaceholder } from "./placeholders";
import { TwitchExtProps, withTwitchExt } from "../utils/twitch";

interface Props {
	dbfId: number;
	x?: number;
	y?: number;
	width?: number;
	flipped?: boolean;
}

class Card extends React.Component<Props & CardsProps & TwitchExtProps> {
	public render(): React.ReactNode {
		const card = this.props.cards.getByDbfId(this.props.dbfId);
		if (!card || !card.id) {
			return <div>Invalid card</div>;
		}

		const widthOverHeight = 512 / 764;

		const viewPortHeight = window.innerHeight;
		const vh = viewPortHeight / 100;
		const height = vh * 46.25;
		const width = height * widthOverHeight;

		const elementWidth = this.props.width || 0;

		const viewPortWidth = window.innerWidth;
		const flip =
			this.props.flipped ||
			(this.props.x || 0) + elementWidth / 2 + width > viewPortWidth;

		const x = this.props.x || 0;

		// Evade black gradients at top and bottom on Twitch
		let topMargin = 0;
		let bottomMargin = 40;
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
					right: flip ? viewPortWidth - x + elementWidth / 2 : "unset",
					pointerEvents: "none",
				}}
				resolution={512}
				placeholder={getPlaceholder(card.type || "")}
			/>
		);
	}
}

export default withCards(withTwitchExt(Card));
