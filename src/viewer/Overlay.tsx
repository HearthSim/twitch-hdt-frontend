import * as React from "react";
import styled from "styled-components";
import { withProps } from "../utils/styled";
import { BoardStateData, EBSConfiguration } from "../twitch-hdt";
import * as PropTypes from "prop-types";
import Entity from "./Entity";
import DeckList from "./DeckList";
import { DecklistPosition, Feature, hasFeature } from "../utils/config";
import { TwitchExtProps, withTwitchExt } from "../utils/twitch";

interface OverlayProps extends React.ClassAttributes<Overlay> {
	boardState: BoardStateData | null;
	config: EBSConfiguration;
}

interface PositionProps {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
}

const Wrapper = styled.div`
	width: 100vw;
	height: 100vh;
	user-select: none;
`;

const Portal = styled.div`
	width: 100vw;
	height: 100vh;
	position: absolute;
	z-index: 999;
	pointer-events: none;
	overflow: hidden;

	& * {
		pointer-events: auto;
	}
`;

const OverlayElement = styled.div`
	position: absolute;
	-webkit-backface-visibility: hidden; // aliasing
`;

const Center = withProps<PositionProps>()(OverlayElement.extend)`
	top: ${(props: any) => props.top || "unset"};
	bottom: ${(props: any) => props.bottom || "unset"};
	height: ${(props: any) => props.height || "unset"};
	margin-left: ${(props: any) => props.left || "unset"};
	width: 100vw;
	text-align: center;
	display: flex;
	justify-content: center;
`;

const Board = withProps<PositionProps>()(Center.extend)`
	width: 100vw;
	height: 15vh;
	top: ${(props: any) => props.top || "unset"};
	bottom: ${(props: any) => props.bottom || "unset"};
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

const Secret = withProps<PositionProps>()(OverlayElement.extend)`
	top: ${(props: any) => props.top || "unset"};
	margin-left: ${(props: any) => props.left || "unset"};

	height: 4.4vh;
	width: 4.4vh;
	left: 50%;
	transform: translate(-50%, 0);
	clip-path: circle(50% at 50% 50%);

	z-index: 51;
`;

const Quest = withProps<PositionProps>()(OverlayElement.extend)`
	top: ${(props: any) => props.top || "unset"};
	bottom: ${(props: any) => props.bottom || "unset"};
	margin-left: ${(props: any) => props.left || "unset"};

	height: 5.1vh;
	width: 4vh;
	left: 50%;
	transform: translate(-50%, 0);
	clip-path: polygon(50% 0%, 83% 12%, 100% 43%, 50% 100%, 0% 43%, 17% 12%);

	z-index: 51;
`;

const HeroPower = withProps<PositionProps>()(OverlayElement.extend)`
	top: ${(props: any) => props.top || "unset"};
	right: ${(props: any) => props.right || "unset"};
	bottom: ${(props: any) => props.bottom || "unset"};

	height: 13.5vh;
	width: 13.5vh;
	clip-path: circle(50% at 50% 50%);
`;

const Weapon = withProps<PositionProps>()(OverlayElement.extend)`
	top: ${(props: any) => props.top || "unset"};
	left: ${(props: any) => props.left || "unset"};
	bottom: ${(props: any) => props.bottom || "unset"};

	height: 13vh;
	width: 13vh;
	clip-path: circle(50% at 50% 50%);
`;

const Deck = withProps<PositionProps>()(OverlayElement.extend)`
	top: ${(props: any) => props.top || "unset"};
	right: ${(props: any) => props.right || "unset"};
	bottom: ${(props: any) => props.bottom || "unset"};
	width: 6vh;
	height: 15vh;
	transform: rotate(-1deg);
`;

const Expander = styled.div`
	width: 100%;
	height: 100%;
`;

const DeckListBounds = withProps<PositionProps>()(styled.div)`
	position: absolute;
	top: ${props => props.top || "100px"};
	width: 100vw;
	height: calc(100vh - ${props => props.top || "100px"} - 80px);
	overflow: hidden;
	pointer-events: none;
	z-index: 100;

	> * > * {
		pointer-events: all;
	}
`;

interface OverlayState {
	hovering?: boolean;
	pinDeck?: boolean;
}

class Overlay extends React.Component<
	OverlayProps & TwitchExtProps,
	OverlayState
> {
	portal: HTMLDivElement | null;
	movementTimeout: number;

	constructor(props: OverlayProps & TwitchExtProps, context: any) {
		super(props, context);
		this.state = {
			hovering: true,
			pinDeck: true,
		};
	}

	componentDidMount(): void {
		this.refreshMovementTimeout();
	}

	clearMovementTimeout() {
		if (!this.movementTimeout) {
			return;
		}
		window.clearTimeout(this.movementTimeout);
	}

	refreshMovementTimeout() {
		this.clearMovementTimeout();
		this.movementTimeout = window.setTimeout(() => {
			this.setState({ hovering: false });
		}, 2500);
	}

	componentWillUnmount(): void {
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
				top: "0vh",
				left: "0.2vh",
			},
			{
				top: "3vh",
				left: "-4.8vh",
			},
			{
				top: "3vh",
				left: "4.8vh",
			},
			{
				top: "8.5vh",
				left: "-7.9vh",
			},
			{
				top: "8.5vh",
				left: "7.9vh",
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

	static childContextTypes = {
		portal: PropTypes.object,
	};

	getChildContext() {
		return { portal: this.portal };
	}

	render() {
		const player =
			this.props.boardState && this.props.boardState.player
				? this.props.boardState.player
				: {};
		const opponent =
			this.props.boardState && this.props.boardState.opponent
				? this.props.boardState.opponent
				: {};

		const hideDecklist =
			!this.props.boardState ||
			hasFeature(
				this.props.config.hidden && !isNaN(+this.props.config.hidden)
					? +this.props.config.hidden
					: 0,
				Feature.DECKLIST,
			);

		return (
			<Wrapper
				onMouseEnter={() => {
					this.setState({ hovering: true });
				}}
				onMouseMove={() => {
					this.refreshMovementTimeout();
				}}
				onMouseLeave={() => {
					this.setState({ hovering: false });
				}}
			>
				<Portal innerRef={(ref: any) => (this.portal = ref)} />
				{hideDecklist ? null : (
					<DeckListBounds
						top={
							this.props.twitchExtContext &&
							(this.props.twitchExtContext.isFullScreen ||
								this.props.twitchExtContext.isTheatreMode)
								? "100px"
								: "50px"
						}
					>
						<DeckList
							cardList={
								player.deck && Array.isArray(player.deck.cards)
									? player.deck.cards
									: []
							}
							name={player.deck && player.deck.name}
							hero={player.deck && player.deck.hero}
							format={player.deck && player.deck.format}
							showRarities={false}
							position={this.props.config.deck_position as DecklistPosition}
							pinned={!!this.state.pinDeck}
							onPinned={(pinDeck: boolean) => {
								this.setState({ pinDeck });
							}}
							hidden={!this.state.pinDeck && !this.state.hovering}
						/>
					</DeckListBounds>
				)}
				<Board top={"29.75vh"}>
					{this.renderBoard(
						Array.isArray(opponent.board) ? opponent.board : [],
					)}
				</Board>
				<Board bottom={"37.6vh"}>
					{this.renderBoard(Array.isArray(player.board) ? player.board : [])}
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
				<Deck top={"24vh"} right={"24vh"}>
					<Expander
						title={
							opponent.deck
								? opponent.deck.size
									? `${opponent.deck.size} card${+opponent.deck.size !== 1
											? "s"
											: ""} remaining`
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
									? `${player.deck.size} card${+player.deck.size !== 1
											? "s"
											: ""} remaining`
									: `Out of cards! Next draw fatigues for ${(player.fatigue ||
											0) + 1} damage.`
								: ""
						}
					/>
				</Deck>
			</Wrapper>
		);
	}
}

export default withTwitchExt(Overlay);
