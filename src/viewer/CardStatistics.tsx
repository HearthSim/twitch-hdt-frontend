import PropTypes from "prop-types";
import React from "react";
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

		const {
			popularity_rank,
			avg_copies_in_deck,
			avg_turns_in_hand,
			avg_turn_played,
			keep_percentage,
			winrate_in_opening_hand,
			winrate_when_drawn,
			winrate_when_played,
		} = this.state.statistics;

		return (
			<CardStatisticsDiv style={this.props.style}>
				<header>
					<h1>{card.name}</h1>
				</header>
				<section>
					<h2>Deckbuilding</h2>
					<dl>
						<dt>Popularity</dt>
						<dd>#{popularity_rank}</dd>
						<dt>Included</dt>
						<dd>{avg_copies_in_deck}</dd>
					</dl>
				</section>
				<section>
					<h2>Mulligan</h2>
					<dl>
						<dt>Kept</dt>
						<dd>{keep_percentage}%</dd>
						<dt>Winrate</dt>
						<dd>{winrate_in_opening_hand}%</dd>
					</dl>
				</section>
				<section>
					<h2>Turns</h2>
					<dl>
						<dt>In Hand</dt>
						<dd>{avg_turns_in_hand}</dd>
						<dt>Played</dt>
						<dd>{avg_turn_played}</dd>
					</dl>
				</section>
				<section>
					<h2>Winrate</h2>
					<dl>
						<dt>Drawn</dt>
						<dd>{winrate_when_drawn}%</dd>
						<dt>Played</dt>
						<dd>{winrate_when_played}%</dd>
					</dl>
				</section>
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
