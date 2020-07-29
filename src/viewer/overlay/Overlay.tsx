import PropTypes from "prop-types";
import * as React from "react";
import styled from "styled-components";
import {
	BnetGameType,
	BoardStateData,
	EBSConfiguration,
} from "../../twitch-hdt";
import {
	Feature,
	hasFeature,
	OverlayPosition,
	WhenToShowBobsBuddy,
} from "../../utils/config";
import { PortalProvider } from "../../utils/portal";
import { TwitchExtProps, withTwitchExt } from "../../utils/twitch";
import Entity from "../Entity";
import { getViewerConfig, setViewerConfig } from "../utils/userconfigutil";
import BobsBuddy from "./BobsBuddy";
import BobsBuddyUserConfig from "./BobsBuddyUserConfig";
import DeckList from "./DeckList";
import PositionableOverlay from "./PositionableOverlay";

export interface PositionProps {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
}

const Wrapper = styled.div`
	width: 100vw;
	height: 100vh;
	user-select: none;
	overflow: hidden;
	-webkit-backface-visibility: hidden;
`;

const Portal = styled.div`
	width: 100vw;
	height: 100vh;
	position: absolute;
	z-index: 999;
	pointer-events: none;
	overflow: hidden;

	> * {
		pointer-events: none;
	}
`;

const OverlayElement = styled.div<PositionProps>`
	position: absolute;
	-webkit-backface-visibility: hidden; // aliasing
`;

const Center = styled(OverlayElement)`
	top: ${props => props.top || "unset"};
	bottom: ${props => props.bottom || "unset"};
	margin-left: ${props => props.left || "unset"};
	width: 100vw;
	text-align: center;
	display: flex;
	justify-content: center;
`;

const Board = styled(Center)`
	width: 100vw;
	height: 15vh;
	top: ${props => props.top || "unset"};
	bottom: ${props => props.bottom || "unset"};
	display: flex;

	justify-content: center;
	transform: rotate(-0.35deg);
`;

const Minion = styled.div`
	width: 11vh;
	height: 15vh;
	margin: 0 0.51vw;
	clip-path: ellipse(50% 50% at 50% 50%);
`;

const Hero = styled.div`
	height: 17.8vh;
	width: 15.5vh;
	clip-path: polygon(
		0% 100%,
		0 40%,
		20% 10%,
		30% 3%,
		50% 0%,
		70% 3%,
		80% 10%,
		100% 40%,
		100% 100%
	);
	z-index: 50;
`;

const Secret = styled(OverlayElement)`
	top: ${props => props.top || "unset"};
	margin-left: ${props => props.left || "unset"};

	height: 4.4vh;
	width: 4.4vh;
	left: 50%;
	transform: translate(-50%, 0);
	clip-path: circle(50% at 50% 50%);

	z-index: 51;
`;

const Quest = styled(OverlayElement)`
	top: ${props => props.top || "unset"};
	bottom: ${props => props.bottom || "unset"};
	margin-left: ${props => props.left || "unset"};

	height: 5.1vh;
	width: 4vh;
	left: 50%;
	transform: translate(-50%, 0);
	clip-path: polygon(50% 0%, 83% 12%, 100% 43%, 50% 100%, 0% 43%, 17% 12%);

	z-index: 51;
`;

const HeroPower = styled(OverlayElement)`
	top: ${props => props.top || "unset"};
	right: ${props => props.right || "unset"};
	bottom: ${props => props.bottom || "unset"};

	height: 13.5vh;
	width: 13.5vh;
	clip-path: circle(50% at 50% 50%);
`;

const Weapon = styled(OverlayElement)`
	top: ${props => props.top || "unset"};
	left: ${props => props.left || "unset"};
	bottom: ${props => props.bottom || "unset"};

	height: 13vh;
	width: 13vh;
	clip-path: circle(50% at 50% 50%);
`;

const Deck = styled(OverlayElement)`
	top: ${props => props.top || "unset"};
	right: ${props => props.right || "unset"};
	bottom: ${props => props.bottom || "unset"};
	width: 6vh;
	height: 15vh;
	transform: rotate(-1deg);
`;

const Statistics = styled.div`
	position: absolute;
	bottom: 0;
	margin-bottom: 5rem;
	width: 24vh;
	font-size: 2vh;
`;

const LeftStatistics = styled(Statistics)`
	left: 20px;
`;

const RightStatistics = styled(Statistics)`
	right: 5rem;
`;

const Offset = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
`;

const Expander = styled.div`
	width: 100%;
	height: 100%;
`;

interface Props {
	boardState: BoardStateData | null;
	config: EBSConfiguration;
}

interface State {
	hovering?: boolean;
	pinDeck?: boolean;
	bobsBuddyEnabled: boolean;
	bobsBuddyShowDuringCombat: boolean;
	bobsBuddyShowDuringShopping: boolean;
}

class Overlay extends React.Component<Props & TwitchExtProps, State> {
	public static childContextTypes = {
		gameType: PropTypes.number.isRequired,
		formatType: PropTypes.number.isRequired,
		portal: PropTypes.object,
		statisticsContainer: PropTypes.object,
	};

	public portal: HTMLDivElement | null = null;
	public movementTimeout: number | null = null;

	constructor(props: Props & TwitchExtProps, context: any) {
		super(props, context);
		this.state = {
			hovering: true,
			pinDeck: true,
			bobsBuddyEnabled: getViewerConfig("bobs_buddy-enabled", "1"),
			bobsBuddyShowDuringCombat: getViewerConfig(
				"bobs_buddy-show_during_combat",
				"1",
			),
			bobsBuddyShowDuringShopping: getViewerConfig(
				"bobs_buddy-show_during_shopping",
				"1",
			),
		};
	}

	public componentDidMount(): void {
		this.refreshMovementTimeout();
	}

	public clearMovementTimeout() {
		if (!this.movementTimeout) {
			return;
		}
		window.clearTimeout(this.movementTimeout);
		this.movementTimeout = null;
	}

	public refreshMovementTimeout() {
		this.clearMovementTimeout();
		this.movementTimeout = window.setTimeout(() => {
			this.setState({ hovering: false });
		}, 2500);
	}

	public componentWillUnmount(): void {
		this.clearMovementTimeout();
	}

	public renderBoard(dbfIds: number[]): any {
		return dbfIds.map((dbfId: number, i: number) => (
			<Minion key={i}>
				<Entity dbfId={dbfId} />
			</Minion>
		));
	}

	public renderSecrets(dbfIds: number[], hasQuest?: boolean): any {
		const secretPositions = [
			{
				left: "0.2vh",
				top: "0vh",
			},
			{
				left: "-4.8vh",
				top: "3vh",
			},
			{
				left: "4.8vh",
				top: "3vh",
			},
			{
				left: "-7.9vh",
				top: "8.5vh",
			},
			{
				left: "7.9vh",
				top: "8.5vh",
			},
		];
		return dbfIds
			.map((dbfId: number, zonePosition: number) => {
				if (hasQuest) {
					zonePosition++;
				}
				const position = secretPositions[zonePosition];
				if (typeof position === "undefined") {
					return null;
				}
				return (
					<Secret key={zonePosition} {...position}>
						<Entity dbfId={dbfId} />
					</Secret>
				);
			})
			.filter(s => s !== null);
	}

	public getChildContext() {
		return {
			formatType:
				this.props.boardState &&
				this.props.boardState.player &&
				this.props.boardState.player.deck
					? this.props.boardState.player.deck.format
					: 2, // default to RANKED_STANDARD
			gameType:
				this.props.boardState && this.props.boardState.game_type
					? this.props.boardState.game_type
					: BnetGameType.BGT_UNKNOWN,
			portal: this.portal,
			statisticsContainer:
				this.props.config.deck_position === OverlayPosition.TOP_RIGHT
					? LeftStatistics
					: RightStatistics,
		};
	}

	public render(): React.ReactNode {
		const { boardState } = this.props;

		const player = boardState && boardState.player ? boardState.player : {};
		const opponent =
			boardState && boardState.opponent ? boardState.opponent : {};

		const gameType =
			boardState && boardState.game_type
				? boardState.game_type
				: BnetGameType.BGT_UNKNOWN;

		const isHidden = (feature: Feature) =>
			hasFeature(
				this.props.config.hidden && !isNaN(+this.props.config.hidden)
					? +this.props.config.hidden
					: 0,
				feature,
			);

		const isEmptyDeck =
			player.deck &&
			Array.isArray(player.deck.cards) &&
			!player.deck.cards.length;

		const ignoreDeck = gameType === BnetGameType.BGT_BATTLEGROUNDS;
		const hideDecklist = isEmptyDeck || ignoreDeck || isHidden(Feature.DECKLIST);
		const hideBobsBuddy =
			gameType != BnetGameType.BGT_BATTLEGROUNDS || isHidden(Feature.BOBSBUDDY);
		const hideTooltips = !boardState || isHidden(Feature.TOOLTIPS);

		return (
			<Wrapper
				onMouseEnter={() => {
					this.setState({ hovering: true });
				}}
				onMouseMove={e => {
					this.refreshMovementTimeout();
					if (!this.state.hovering) {
						this.setState({ hovering: true });
					}
				}}
				onMouseLeave={() => {
					this.setState({ hovering: false });
				}}
			>
				<Portal ref={ref => (this.portal = ref)} />
				<PortalProvider value={{ portal: this.portal }}>
					{hideDecklist ? null : (
						<PositionableOverlay
							position={
								this.props.config.deck_position === OverlayPosition.TOP_RIGHT
									? OverlayPosition.TOP_RIGHT
									: OverlayPosition.TOP_LEFT
							}
							engaged={this.state.hovering}
							hidden={!this.state.pinDeck && !this.state.hovering}
							movable={true}
						>
							{({ moving, onMoveStart, onMoveEnd }) => (
								<DeckList
									cardList={
										player.deck && Array.isArray(player.deck.cards)
											? player.deck.cards
											: []
									}
									format={
										player.deck && player.deck.format
											? player.deck.format
											: null
									}
									hero={
										player.deck && player.deck.hero ? player.deck.hero : null
									}
									name={player.deck && player.deck.name}
									showRarities={false}
									position={
										this.props.config.deck_position ===
										OverlayPosition.TOP_RIGHT
											? OverlayPosition.TOP_RIGHT
											: OverlayPosition.TOP_LEFT
									}
									pinned={!!this.state.pinDeck}
									onPinned={(pinDeck: boolean) => {
										this.setState({ pinDeck });
									}}
									hidden={!boardState}
									moving={moving}
									onMoveStart={onMoveStart}
									onMoveEnd={onMoveEnd}
									deck={player.deck || null}
								/>
							)}
						</PositionableOverlay>
					)}
					{boardState != null &&
					boardState.bobs_buddy_state != undefined &&
					!hideBobsBuddy ? (
						<>
							{this.state.bobsBuddyEnabled ? (
								<PositionableOverlay
									position={OverlayPosition.TOP_CENTER}
									engaged={this.state.hovering}
									hidden={false}
									movable={false}
								>
									{({ moving, onMoveStart, onMoveEnd }) =>
										boardState != null &&
										boardState.bobs_buddy_state !== undefined ? (
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
												userSeesDuringCombat={
													this.state.bobsBuddyShowDuringCombat
												}
												userSeesDuringShopping={
													this.state.bobsBuddyShowDuringShopping
												}
												moving={moving}
												onMoveStart={onMoveStart}
												onMoveEnd={onMoveEnd}
												layout="overlay"
											/>
										) : null
									}
								</PositionableOverlay>
							) : null}
							<BobsBuddyUserConfig
								show={!!this.state.hovering}
								enabled={this.state.bobsBuddyEnabled}
								showDuringCombat={this.state.bobsBuddyShowDuringCombat}
								showDuringShopping={this.state.bobsBuddyShowDuringShopping}
								onEnabledChanged={(enabled: boolean) => {
									this.setState({ bobsBuddyEnabled: enabled });
									setViewerConfig("bobs_buddy-enabled", enabled);
								}}
								onShowDuringCombatChanged={(show: boolean) => {
									this.setState({ bobsBuddyShowDuringCombat: show });
									setViewerConfig("bobs_buddy-show_during_combat", show);
								}}
								onShowDuringShoppingChanged={(show: boolean) => {
									this.setState({ bobsBuddyShowDuringShopping: show });
									setViewerConfig("bobs_buddy-show_during_shopping", show);
								}}
								streamerShowsDuringCombat={
									this.props.config.when_to_show_bobs_buddy ===
										WhenToShowBobsBuddy.All ||
									this.props.config.when_to_show_bobs_buddy ===
										WhenToShowBobsBuddy.OnlyInCombat
								}
								streamerShowsDuringShopping={
									this.props.config.when_to_show_bobs_buddy ===
										WhenToShowBobsBuddy.All ||
									this.props.config.when_to_show_bobs_buddy ===
										WhenToShowBobsBuddy.OnlyInShopping
								}
							/>
						</>
					) : null}

					{hideTooltips ? null : (
						<Offset
							style={{
								left:
									this.props.config && this.props.config.game_offset_horizontal
										? `${+this.props.config.game_offset_horizontal}%`
										: "unset",
							}}
						>
							<Board top={"29.75vh"}>
								{this.renderBoard(
									Array.isArray(opponent.board) ? opponent.board : [],
								)}
							</Board>
							<Board bottom={"37.6vh"}>
								{this.renderBoard(
									Array.isArray(player.board) ? player.board : [],
								)}
							</Board>
							<Quest top={"7.0vh"} left={"0.32vh"}>
								<Entity dbfId={opponent.quest ? opponent.quest.dbfId : null} />
							</Quest>
							<Quest bottom={"30.4vh"}>
								<Entity dbfId={player.quest ? player.quest.dbfId : null} />
							</Quest>
							<Center top={"8vh"} left={"0.1vh"}>
								{this.renderSecrets(
									Array.isArray(opponent.secrets) ? opponent.secrets : [],
									!!opponent.quest,
								)}
							</Center>
							<Center bottom={"35vh"}>
								{this.renderSecrets(
									Array.isArray(player.secrets) ? player.secrets : [],
									!!player.quest,
								)}
							</Center>
							<Center top={"8vh"}>
								<Hero>
									<Entity dbfId={opponent.hero || null} />
								</Hero>
							</Center>
							<Center bottom={"15.2vh"}>
								<Hero>
									<Entity dbfId={player.hero || null} />
								</Hero>
							</Center>
							<HeroPower top={"15vh"} right={"66.4vh"}>
								<Entity dbfId={opponent.hero_power || null} />
							</HeroPower>
							<HeroPower bottom={"16.9vh"} right={"65.6vh"}>
								<Entity dbfId={player.hero_power || null} />
							</HeroPower>
							<Weapon top={"15.5vh"} left={"65.8vh"}>
								<Entity dbfId={opponent.weapon || null} />
							</Weapon>
							<Weapon bottom={"16.8vh"} left={"64.25vh"}>
								<Entity dbfId={player.weapon || null} />
							</Weapon>
							{!ignoreDeck ? (
								<>
									<Deck top={"24vh"} right={"24vh"}>
										<Expander
											title={
												opponent.deck
													? opponent.deck.size
														? `${opponent.deck.size} card${
																+opponent.deck.size !== 1 ? "s" : ""
														  } remaining`
														: `Out of cards! Next draw fatigues for ${(opponent.fatigue ||
																0) + 1} damage.`
													: ""
											}
										/>
									</Deck>
									<Deck bottom={"33vh"} right={"24vh"}>
										<Expander
											title={
												player.deck
													? player.deck.size
														? `${player.deck.size} card${
																+player.deck.size !== 1 ? "s" : ""
														  } remaining`
														: `Out of cards! Next draw fatigues for ${(player.fatigue ||
																0) + 1} damage.`
													: ""
											}
										/>
									</Deck>
								</>
							) : null}
						</Offset>
					)}
				</PortalProvider>
			</Wrapper>
		);
	}
}

export default withTwitchExt(Overlay);
