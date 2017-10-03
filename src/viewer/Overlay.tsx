import * as React from "react";
import styled from "styled-components";
import { withProps } from "../utils/styled";
import { BoardStateData } from "../twitch-hdt";
import * as PropTypes from "prop-types";
import Entity from "./Entity";

interface OverlayProps extends React.ClassAttributes<Overlay> {
	boardState?: BoardStateData | null;
}

interface PositionProps {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
}

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

class Overlay extends React.Component<OverlayProps, {}> {
	portal: HTMLDivElement | null;

	public renderBoard(dbfIds: number[]): any {
		return dbfIds.map((dbfId: number, i: number) => (
			<Minion key={i}>
				<Entity dbfId={dbfId} />
			</Minion>
		));
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

		return [
			<Portal key="portal" innerRef={(ref: any) => (this.portal = ref)} />,
			<Board key="opponentBoard" top={"29.75vh"}>
				{this.renderBoard(Array.isArray(opponent.board) ? opponent.board : [])}
			</Board>,
			<Board key="playerBoard" bottom={"37.6vh"}>
				{this.renderBoard(Array.isArray(player.board) ? player.board : [])}
			</Board>,
			<Center key="opponentHero" top={"8vh"}>
				<Hero>
					<Entity dbfId={opponent.hero || null} />
				</Hero>
			</Center>,
			<Center key="playerHero" bottom={"15.2vh"}>
				<Hero>
					<Entity dbfId={player.hero || null} />
				</Hero>
			</Center>,
			<HeroPower key="opponentHeroPower" top={"15vh"} right={"66.4vh"}>
				<Entity dbfId={opponent.hero_power || null} />
			</HeroPower>,
			<HeroPower key="playerHeroPower" bottom={"16.9vh"} right={"65.6vh"}>
				<Entity dbfId={player.hero_power || null} />
			</HeroPower>,
			<Weapon key="opponentWeapon" top={"15.5vh"} left={"65.8vh"}>
				<Entity dbfId={opponent.weapon || null} flipped />
			</Weapon>,
			<Weapon key="playerWeapon" bottom={"16.8vh"} left={"64.25vh"}>
				<Entity dbfId={player.weapon || null} flipped />
			</Weapon>,
		] as any;
	}
}

export default Overlay;
