import * as React from "react";
import styled from "styled-components";
import { withProps } from "../utils/styled";
import { BoardStateData } from "../twitch-hdt";
import * as PropTypes from "prop-types";
import Entity from "./Entity";
import DeckList from "./DeckList";
import { DecklistPosition } from "../config/configuration";
import { TwitchExtProps, witchTwitchExt } from "../utils/twitch";

interface OverlayProps extends React.ClassAttributes<Overlay> {
	boardState?: BoardStateData | null;
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

const DeckListBounds = withProps<PositionProps>()(styled.div)`
	position: absolute;
	top: ${props => props.top || "100px"};
	width: 100vw;
	height: calc(100vh - ${props => props.top || "100px"} - 80px);
	overflow: hidden;
	pointer-events: none;
	z-index: 100;

	> * {
		pointer-events: all;
	}
`;

class Overlay extends React.Component<OverlayProps & TwitchExtProps, {}> {
	portal: HTMLDivElement | null;

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

		return (
			<Wrapper>
				<Portal key="portal" innerRef={(ref: any) => (this.portal = ref)} />
				<DeckListBounds
					key="decklist"
					top={
						this.props.twitchExtContext &&
						(this.props.twitchExtContext.isFullScreen ||
							this.props.twitchExtContext.isTheatreMode)
							? "100px"
							: "50px"
					}
				>
					<DeckList
						cardList={player.deck && player.deck.cards ? player.deck.cards : []}
						rarities={false}
						position={DecklistPosition.TOP_RIGHT}
					/>
				</DeckListBounds>
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
				<HeroPower key="opponentHeroPower" top={"15vh"} right={"66.4vh"}>
					<Entity dbfId={opponent.hero_power || null} />
				</HeroPower>
				<HeroPower key="playerHeroPower" bottom={"16.9vh"} right={"65.6vh"}>
					<Entity dbfId={player.hero_power || null} />
				</HeroPower>
				<Weapon top={"15.5vh"} left={"65.8vh"}>
					<Entity dbfId={opponent.weapon || null} />
				</Weapon>
				<Weapon bottom={"16.8vh"} left={"64.25vh"}>
					<Entity dbfId={player.weapon || null} />
				</Weapon>
			</Wrapper>
		);
	}
}

export default witchTwitchExt(Overlay);
