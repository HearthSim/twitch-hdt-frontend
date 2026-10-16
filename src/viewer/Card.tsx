import * as React from "react";
import { Card as ComponentCard } from "react-hs-components";
import { HearthstoneLocale } from "react-hs-components/dist/components/Card";
import { CardReference } from "../twitch-hdt";
import { formatCardText, getAssembledCardText } from "../utils/assemble";
import {
	CardHalves,
	CardsProps,
	getHearthstoneLocaleFromTwitchLocale,
	ResolvedCard,
	resolveCard,
	withCards,
} from "../utils/cards";
import {
	TwitchExtConsumer,
	TwitchExtConsumerArgs,
	TwitchExtProps,
	withTwitchExt,
} from "../utils/twitch";
import AssembledCardText, { TextLayout } from "./AssembledCardText";
import { getNotFound } from "./notfound";
import { getPlaceholder } from "./placeholders";
import {
	TooltipBehaviour,
	TooltipConsumer,
	TooltipConsumerArgs,
} from "./utils/tooltips";

interface Props {
	cardId: CardReference;
	extraCardIds?: CardReference[];
	halves?: CardHalves;
	x?: number;
	y?: number;
	width?: number;
	flipped?: boolean;
	battlegrounds?: boolean;
}

const WIDTH_OVER_HEIGHT = 512 / 764;
// the natural size of a minion render at resolution 512
const RENDER_WIDTH = 512;
const RENDER_HEIGHT = 776;
const EXTRA_GAP = 6;
const EXTRA_SCALE = 0.8;

class Card extends React.Component<Props & CardsProps & TwitchExtProps> {
	public render(): React.ReactNode {
		return (
			<TwitchExtConsumer>
				{({ query }: TwitchExtConsumerArgs) => (
					<TooltipConsumer>
						{({ behaviour }: TooltipConsumerArgs): React.ReactNode => {
							const primary = resolveCard(this.props.cards, this.props.cardId);
							if (!primary.cardId) {
								return <div>Invalid card</div>;
							}

							const extras = (this.props.extraCardIds || [])
								.map((cardId) => resolveCard(this.props.cards, cardId))
								.filter((extra) => !!extra.cardId);

							const locale = getHearthstoneLocaleFromTwitchLocale(
								query.language || "en",
							);

							// the render shows the card as printed, so an assembled minion gets its
							// text drawn over it
							const assembled = getAssembledCardText(
								this.props.halves,
								primary.card,
								this.props.cards,
							);
							const text =
								assembled !== null
									? {
											html: formatCardText(assembled),
											layout: getTextLayout(primary),
									  }
									: null;

							switch (behaviour) {
								case TooltipBehaviour.FULLSCREEN:
									return this.renderFullscreen(primary, extras, locale, text);
								case TooltipBehaviour.ATTACHED:
								default:
									return this.renderAttached(primary, extras, locale, text);
							}
						}}
					</TooltipConsumer>
				)}
			</TwitchExtConsumer>
		);
	}

	private renderFullscreen(
		primary: ResolvedCard,
		extras: ResolvedCard[],
		locale: HearthstoneLocale,
		text: AssembledText | null,
	): React.ReactNode {
		const centered: React.CSSProperties = {
			position: "absolute",
			left: "50%",
			top: "50%",
			transform: "translateX(-50%) translateY(-50%)",
			pointerEvents: "none",
			touchAction: "none",
		};

		if (!extras.length) {
			const card = (
				<ComponentCard
					id={primary.cardId as string}
					resolution={512}
					locale={locale}
					placeholder={getPlaceholder(
						getType(primary),
						this.props.battlegrounds ?? false,
					)}
					battlegrounds={this.props.battlegrounds}
				/>
			);
			if (text === null) {
				return React.cloneElement(card, {
					style: { ...centered, maxHeight: "100%", maxWidth: "100%" },
				});
			}
			// the text layer is sized from the card, so give it the height the image would shrink to
			const fittedHeight = Math.min(
				RENDER_HEIGHT,
				window.innerHeight,
				(window.innerWidth * RENDER_HEIGHT) / RENDER_WIDTH,
			);
			return this.renderWithText(card, centered, fittedHeight, text);
		}

		let height = window.innerHeight * 0.9;
		let extraHeight = getExtraHeight(height, extras.length);
		const maxWidth = window.innerWidth * 0.95;
		const totalWidth = (height + extraHeight) * WIDTH_OVER_HEIGHT + EXTRA_GAP;
		if (totalWidth > maxWidth) {
			const scale = maxWidth / totalWidth;
			height *= scale;
			extraHeight *= scale;
		}

		return (
			<div
				style={{
					...centered,
					height,
					display: "flex",
					alignItems: "center",
					gap: `${EXTRA_GAP}px`,
				}}
			>
				{this.renderWithText(
					<ComponentCard
						id={primary.cardId as string}
						resolution={512}
						locale={locale}
						placeholder={getPlaceholder(
							getType(primary),
							this.props.battlegrounds ?? false,
						)}
					/>,
					{},
					height,
					text,
				)}
				{this.renderExtras(
					extras,
					extraHeight,
					locale,
					this.props.battlegrounds ?? false,
				)}
			</div>
		);
	}

	private renderAttached(
		primary: ResolvedCard,
		extras: ResolvedCard[],
		locale: HearthstoneLocale,
		text: AssembledText | null,
	): React.ReactNode {
		const viewPortHeight = window.innerHeight;
		const vh = viewPortHeight / 100;
		const height = vh * 46.25;
		const width = height * WIDTH_OVER_HEIGHT;

		const extraHeight = getExtraHeight(height, extras.length);
		const totalWidth = extras.length
			? width + EXTRA_GAP + extraHeight * WIDTH_OVER_HEIGHT
			: width;

		const elementWidth = this.props.width || 0;

		const viewPortWidth = window.innerWidth;
		const flip =
			this.props.flipped ||
			(this.props.x || 0) + elementWidth / 2 + totalWidth > viewPortWidth;

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

		const position: React.CSSProperties = {
			position: "absolute",
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
		};

		let triple = false;
		if (this.props.battlegrounds && primary.card) {
			const card = primary.card;
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
		}

		const card = this.renderWithText(
			<ComponentCard
				id={primary.cardId as string}
				resolution={512}
				locale={locale}
				notFound={getNotFound(getType(primary))}
				placeholder={getPlaceholder(
					getType(primary),
					this.props.battlegrounds ?? false,
				)}
				battlegrounds={this.props.battlegrounds}
				triple={triple}
			/>,
			extras.length ? {} : position,
			height,
			text,
		);

		if (!extras.length) {
			return card;
		}

		return (
			<div
				style={{
					...position,
					height,
					display: "flex",
					alignItems: "center",
					// keep the extras on the outer side, away from the board
					flexDirection: flip ? "row-reverse" : "row",
					gap: `${EXTRA_GAP}px`,
				}}
			>
				{card}
				{this.renderExtras(
					extras,
					extraHeight,
					locale,
					this.props.battlegrounds ?? false,
				)}
			</div>
		);
	}

	/**
	 * Places the card at the given position and height, with the text drawn over its text box if
	 * there is any.
	 */
	private renderWithText(
		card: React.ReactElement,
		style: React.CSSProperties,
		height: number,
		text: AssembledText | null,
	): React.ReactNode {
		if (text === null) {
			return React.cloneElement(card, { style: { ...style, height } });
		}
		return (
			// sized up front so the text fits the card before the image has loaded
			<div
				style={{
					position: "relative",
					...style,
					height,
					width: (height * RENDER_WIDTH) / RENDER_HEIGHT,
				}}
			>
				{React.cloneElement(card, {
					style: { display: "block", width: "100%", height: "100%" },
				})}
				<AssembledCardText
					text={text.html}
					layout={text.layout}
					height={height}
				/>
			</div>
		);
	}

	private renderExtras(
		extras: ResolvedCard[],
		height: number,
		locale: HearthstoneLocale,
		battlegrounds: boolean,
	): React.ReactNode {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					gap: `${EXTRA_GAP}px`,
				}}
			>
				{extras.map((extra, index) => (
					<ComponentCard
						key={`${extra.cardId}-${index}`}
						id={extra.cardId as string}
						style={{ height }}
						resolution={512}
						locale={locale}
						notFound={getNotFound(getType(extra))}
						placeholder={getPlaceholder(getType(extra), battlegrounds)}
						battlegrounds={battlegrounds}
					/>
				))}
			</div>
		);
	}
}

interface AssembledText {
	html: string;
	layout: TextLayout;
}

// Rajh turns an assembled minion into a hero power, every other assembled card is a minion
function getTextLayout(resolved: ResolvedCard): TextLayout {
	return getType(resolved) === "HERO_POWER" ? "hero_power" : "minion";
}

function getType({ card }: ResolvedCard): string {
	return card ? card.type || "" : "";
}

function getExtraHeight(height: number, count: number): number {
	if (count < 1) {
		return 0;
	}
	// shrink instead of overflowing when there are many extras
	return Math.min(
		height * EXTRA_SCALE,
		(height - EXTRA_GAP * (count - 1)) / count,
	);
}

export default withCards(withTwitchExt(Card));
