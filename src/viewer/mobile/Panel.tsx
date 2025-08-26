import PropTypes from "prop-types";
import * as React from "react";
import styled from "styled-components";
import {
	BnetGameType,
	BoardStateData,
	BoardStatePlayer,
	EBSConfiguration,
} from "../../twitch-hdt";
import { Feature, hasFeature, WhenToShowBobsBuddy } from "../../utils/config";
import { PortalProvider } from "../../utils/portal";
import { TwitchExtProps, withTwitchExt } from "../../utils/twitch";
import CopyDeckButton, { CopyDeckButtonChildProps } from "../CopyDeckButton";
import { HSReplayNetIcon } from "../icons";
import BobsBuddy from "../overlay/BobsBuddy";
import { TooltipBehaviour, TooltipProvider } from "../utils/tooltips";
import CardList from "./CardList";
import Scroller from "./Scroller";
import CardTile from "../CardTile";
import { isBattlegroundsGameType } from "../../utils/hearthstone";

interface Props {
	boardState: BoardStateData | null;
	config: EBSConfiguration;
}

interface State {
	timedOut: boolean;
	hadBoardState: boolean;
}

const PanelDiv = styled.div<ThemeProps>`
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	position: relative;
	overflow: hidden;
	user-select: none;
	background-color: ${(props: ThemeProps) =>
		props.dark ? "#141528" : "white"};
`;

const Portal = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
	z-index: 999;
	pointer-events: none;
	overflow: hidden;

	> * {
		pointer-events: none;
	}
`;

export interface ThemeProps {
	dark: boolean;
}

const Message = styled.div<ThemeProps>`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	color: ${(props: ThemeProps) => (props.dark ? "white" : "black")};
	background-color: ${(props: ThemeProps) =>
		props.dark ? "#141528" : "white"};

	> {
		h1 {
			font-size: 1.5em;
		}

		p,
		h1 {
			margin: 0.2em;
		}
	}
`;

const MessageFooter = styled.footer<ThemeProps>`
	display: flex;
	flex-direction: row;
	align-items: center;
	position: absolute;
	bottom: 0;
	right: 0;
	font-weight: bold;
	margin: 0.5em;

	img {
		height: 25px;
		margin-right: 0.4em;
		filter: ${(props: ThemeProps) =>
			!props.dark ? "invert(100%)" : "invert(0%)"};
	}
`;

const Header = styled.header`
	width: 100%;
	text-align: center;
	color: white;
	background: #315376;
	height: 45px;
	box-sizing: content-box;

	display: flex;
	flex-direction: row;
	align-items: center;
	border-bottom: solid 1px black;

	font-size: 0.85em;
	font-family: sans-serif;
	font-weight: bold;
	text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
		1px 1px 0 #000;
	white-space: nowrap;

	h1 {
		font-size: 1em;
		text-align: left;
		flex-grow: 1;
		padding: 0 6px 0 1px;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	button {
		height: 100%;
		margin: 0;
		color: white;
		background: #315376;
		text-align: center;
		font-size: 1em;
		border: 0;
		border-left: solid 1px black;
		font-weight: bold;
		padding: 0 1em;

		text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
			1px 1px 0 #000;

		&:active {
			background-color: #1c2f42;
			outline: none;
		}
	}
`;

const HeaderIcon = styled.img`
	box-sizing: border-box;
	height: 100%;
	filter: drop-shadow(-1px -1px 0 rgba(0, 0, 0, 0.5))
		drop-shadow(-1px 1px 0 rgba(0, 0, 0, 0.5))
		drop-shadow(1px -1px 0 rgba(0, 0, 0, 0.5))
		drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.5));
	padding: 8px 3px;
`;

const BattlegroundsContainer = styled.div`
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

class Panel extends React.Component<Props & TwitchExtProps, State> {
	public static getDerivedStateFromProps(
		nextProps: Props & TwitchExtProps,
		prevState: State,
	) {
		if (
			!!nextProps.boardState &&
			(!prevState.hadBoardState || prevState.timedOut)
		) {
			return { hadBoardState: true, timedOut: false };
		}
		return null;
	}

	public static childContextTypes = {
		portal: PropTypes.object,
	};

	private timeout: number | null = null;
	private portal: HTMLDivElement | null = null;

	constructor(props: Props & TwitchExtProps, context: any) {
		super(props, context);
		this.state = {
			hadBoardState: !!props.boardState,
			timedOut: false,
		};
	}

	public componentDidMount(): void {
		if (!this.props.boardState) {
			this.setTimeout();
		}
	}

	public componentDidUpdate(
		prevProps: Readonly<Props & TwitchExtProps>,
		prevState: Readonly<State>,
		snapshot?: never,
	): void {
		if (this.props.boardState) {
			this.clearTimeout();
		}
	}

	public componentWillUnmount(): void {
		this.clearTimeout();
	}

	public render(): React.ReactNode {
		const { boardState } = this.props;

		const player: BoardStatePlayer | null =
			(boardState && boardState.player) || null;
		const deck = player && player.deck;
		const isDark = this.props.twitchExtContext
			? this.props.twitchExtContext.theme === "dark"
			: false;
		const isBattlegrounds =
			boardState && isBattlegroundsGameType(boardState.game_type);
		const emptyDeck = deck && deck.cards && !deck.cards.length;

		const isHidden = (feature: Feature) =>
			hasFeature(
				this.props.config.hidden && !isNaN(+this.props.config.hidden)
					? +this.props.config.hidden
					: 0,
				feature,
			);

		const gameType =
			boardState && boardState.game_type
				? boardState.game_type
				: BnetGameType.BGT_UNKNOWN;

		const showBobsBuddy = !isHidden(Feature.BOBSBUDDY);

		const showDeckList = !isHidden(Feature.DECKLIST);

		if (!isBattlegrounds && (!player || !deck || !deck.cards || emptyDeck)) {
			if (this.state.hadBoardState || this.state.timedOut || emptyDeck) {
				return (
					<Message dark={isDark}>
						<h1>No deck available</h1>
						<p>There's no deck available right now.</p>
						<MessageFooter dark={isDark}>
							<img src={HSReplayNetIcon} /> HSReplay.net
						</MessageFooter>
					</Message>
				);
			}
			return <Message dark={isDark}>Loading…</Message>;
		}

		return (
			<TooltipProvider value={{ behaviour: TooltipBehaviour.FULLSCREEN }}>
				<PanelDiv dark={isDark}>
					<Portal ref={(ref) => (this.portal = ref)} />
					<PortalProvider value={{ portal: this.portal }}>
						{isBattlegrounds ? (
							boardState ? (
								<BattlegroundsContainer>
									{boardState.bobs_buddy_state != null && showBobsBuddy ? (
										<BobsBuddy
											winRate={boardState.bobs_buddy_state.win_rate}
											tieRate={boardState.bobs_buddy_state.tie_rate}
											lossRate={boardState.bobs_buddy_state.loss_rate}
											playerLethal={
												boardState.bobs_buddy_state.player_lethal_rate
											}
											opponentLethal={
												boardState.bobs_buddy_state.opponent_lethal_rate
											}
											simulationState={
												boardState.bobs_buddy_state.simulation_state
											}
											whenToShowStats={
												this.props.config.when_to_show_bobs_buddy
													? (this.props.config
															.when_to_show_bobs_buddy as WhenToShowBobsBuddy)
													: WhenToShowBobsBuddy.All
											}
											userSeesDuringCombat={true}
											userSeesDuringShopping={true}
											layout="mobile"
										/>
									) : null}
									{boardState && boardState.battlegrounds_anomaly ? (
										<div>
											<Header style={{ paddingLeft: "3px" }}>
												<h1>Battlegrounds Anomaly (tap and hold)</h1>
											</Header>
											<CardTile
												dbfId={boardState.battlegrounds_anomaly}
												showRarity={false}
											/>
										</div>
									) : null}
								</BattlegroundsContainer>
							) : null
						) : showDeckList && deck && deck.cards ? (
							<>
								<Header>
									<HeaderIcon src={HSReplayNetIcon} />
									<h1>{deck.name || "HSReplay.net"}</h1>
									<CopyDeckButton deck={deck}>
										{({
											onClick,
											copied,
											disabled,
										}: CopyDeckButtonChildProps) => (
											<button onClick={onClick} disabled={disabled}>
												{copied ? "Copied" : "Copy Deck"}
											</button>
										)}
									</CopyDeckButton>
								</Header>
								<Scroller>
									<CardList cardList={deck.cards} />
								</Scroller>
							</>
						) : null}
					</PortalProvider>
				</PanelDiv>
			</TooltipProvider>
		);
	}

	private clearTimeout(): void {
		if (this.timeout === null) {
			return;
		}
		window.clearTimeout(this.timeout);
		this.timeout = null;
	}

	private setTimeout(): void {
		this.clearTimeout();
		this.timeout = window.setTimeout(() => {
			this.setState({ timedOut: true });
		}, 30 * 1000);
	}
}

export default withTwitchExt(Panel);
