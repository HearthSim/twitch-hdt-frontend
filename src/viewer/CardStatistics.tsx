import PropTypes from "prop-types";
import * as React from "react";
import styled from "styled-components";
import { SingleCardDetailsPayload } from "../hsreplaynet";
import { FormatType } from "../twitch-hdt";
import { CardsProps, isPlayableCard, withCards } from "../utils/cards";
import { HSReplayNetIcon } from "./icons/index";
import { Icon } from "./overlay/DeckList";

const CardStatisticsDiv = styled.div`
	color: white;
	border: solid 0.01em white;
	background-color: #1d3657;
	text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
		1px 1px 0 #000;

	header {
		padding: 0;
		margin: 0.7em 0.25em 0.55em 0.25em;
	}

	section {
		padding: 0;
		margin: 0 0.25em 0.5em 0.4em;
	}

	h1,
	h2,
	dt,
	dd {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	h1 {
		margin: 0;
		text-align: center;
		font-size: 1em;
	}

	h2 {
		padding: 0;
		margin: 0 0 0.25em 0;
		font-size: 0.8em;
		font-family: sans-serif;
		font-weight: bold;
		color: white;
		width: 100%;
	}

	dl {
		columns: 2;
		margin: 0;
	}

	dt {
		font-size: 0.7em;
		text-shadow: none;
		text-transform: uppercase;
		line-height: 1.1em;
	}

	dd {
		font-weight: bold;
	}

	dt,
	dd {
		text-align: left;
		margin-left: 0;
	}

	footer {
		margin: 0.75em 0 0.35em 0;
		padding-right: 0.6em;
		text-align: center;

		small {
			font-size: 0.8em;
			display: block;
			padding-left: 0.41em;
			width: 100%;
			margin-bottom: -0.65em;
		}

		img {
			display: inline-block;
			width: 1.4em;
			margin-right: 0.4em;
			vertical-align: middle;
		}

		strong {
			display: inline-block;
			vertical-align: middle;
			position: relative;
		}
	}
`;

interface Props {
	dbfId: number | null;
	formatType: FormatType;
	style?: React.CSSProperties;
}

interface State {
	statistics: SingleCardDetailsPayload | null;
}

class CardStatistics extends React.Component<Props & CardsProps, State> {
	constructor(props: Props & CardsProps, context: any) {
		super(props, context);
		this.state = {
			statistics: null,
		};
	}

	public static contextTypes = {
		fetchStatistics: PropTypes.func.isRequired,
	};

	public componentDidMount(): void {
		this.requestStats();
	}

	public async requestStats() {
		try {
			this.setState({
				statistics: await this.context.fetchStatistics(
					this.props.dbfId,
					this.props.formatType,
				),
			});
		} catch (e) {
			console.error(e);
		}
	}

	public render(): React.ReactNode {
		if (!this.props.dbfId || this.state.statistics === null) {
			return null;
		}

		const card = this.props.cards.getByDbfId(this.props.dbfId);
		if (!card || !card.collectible || !isPlayableCard(card)) {
			return null;
		}

		const stats = this.state.statistics;
		const popularityRank =
			typeof stats.popularity_rank !== "undefined"
				? stats.popularity_rank
				: null;
		const avgCopiesInDeck =
			typeof stats.avg_copies_in_deck !== "undefined"
				? stats.avg_copies_in_deck
				: null;
		const avgTurnsInHand =
			typeof stats.avg_turns_in_hand !== "undefined"
				? stats.avg_turns_in_hand
				: null;
		const avgTurnPlayed =
			typeof stats.avg_turn_played !== "undefined"
				? stats.avg_turn_played
				: null;
		const keepPercentage =
			typeof stats.keep_percentage !== "undefined"
				? stats.keep_percentage
				: null;
		const winrateInOpeningHand =
			typeof stats.winrate_in_opening_hand !== "undefined"
				? stats.winrate_in_opening_hand
				: null;
		const winrateWhenDrawn =
			typeof stats.winrate_when_drawn !== "undefined"
				? stats.winrate_when_drawn
				: null;
		const winrateWhenPlayed =
			typeof stats.winrate_when_played !== "undefined"
				? stats.winrate_when_played
				: null;

		// do not render at all if all statistics are invalid
		if (
			[
				popularityRank,
				avgCopiesInDeck,
				avgTurnsInHand,
				avgTurnPlayed,
				keepPercentage,
				winrateInOpeningHand,
				winrateWhenDrawn,
				winrateWhenPlayed,
			].every((x) => x === null)
		) {
			return null;
		}

		return (
			<CardStatisticsDiv style={this.props.style}>
				<header>
					<h1>{card.name}</h1>
				</header>
				{popularityRank !== null || avgCopiesInDeck !== null ? (
					<section>
						<h2>Deckbuilding</h2>
						<dl>
							{popularityRank !== null ? (
								<>
									<dt>Popularity</dt>
									<dd>#{popularityRank}</dd>
								</>
							) : null}
							{avgCopiesInDeck !== null ? (
								<>
									<dt>Included</dt>
									<dd>{avgCopiesInDeck}</dd>
								</>
							) : null}
						</dl>
					</section>
				) : null}
				{keepPercentage !== null || winrateInOpeningHand !== null ? (
					<section>
						<h2>Mulligan</h2>
						<dl>
							{keepPercentage !== null ? (
								<>
									<dt>Kept</dt>
									<dd>{keepPercentage}%</dd>
								</>
							) : null}
							{winrateInOpeningHand !== null ? (
								<>
									<dt>Winrate</dt>
									<dd>{winrateInOpeningHand}%</dd>
								</>
							) : null}
						</dl>
					</section>
				) : null}
				{avgTurnsInHand !== null || avgTurnPlayed !== null ? (
					<section>
						<h2>Turns</h2>
						<dl>
							{avgTurnsInHand !== null ? (
								<>
									<dt>In Hand</dt>
									<dd>{avgTurnsInHand}</dd>
								</>
							) : null}
							{avgTurnPlayed !== null ? (
								<>
									<dt>Played</dt>
									<dd>{avgTurnPlayed}</dd>
								</>
							) : null}
						</dl>
					</section>
				) : null}
				{winrateWhenDrawn !== null || winrateWhenPlayed !== null ? (
					<section>
						<h2>Winrate</h2>
						<dl>
							{winrateWhenDrawn !== null ? (
								<>
									<dt>Drawn</dt>
									<dd>{winrateWhenDrawn}%</dd>
								</>
							) : null}
							{winrateWhenPlayed !== null ? (
								<>
									<dt>Played</dt>
									<dd>{winrateWhenPlayed}%</dd>
								</>
							) : null}
						</dl>
					</section>
				) : null}
				<footer>
					<small>More stats on</small>
					<Icon src={HSReplayNetIcon} title="Powered by HSReplay.net" />
					<strong>HSReplay.net</strong>
				</footer>
			</CardStatisticsDiv>
		);
	}
}

export default withCards(CardStatistics);
