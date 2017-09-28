import * as React from "react";
import styled from "styled-components";
import Minion from "./Minion";
import { withProps } from "../utils/styled";
import { BoardStateData } from "../twitch-hdt";
import * as PropTypes from "prop-types";

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

const Board = withProps<PositionProps>()(OverlayElement.extend)`
	width: 100vw;
	height: 15vh;
	opacity: 0.5;
	top: ${(props: any) => props.top || "unset"};
	bottom: ${(props: any) => props.bottom || "unset"};
	text-align: center;
	display: flex;

	justify-content: center;
	transform: rotate(-0.35deg);
`;

class Overlay extends React.Component<OverlayProps, {}> {
	portal: HTMLDivElement | null;

	public renderBoard(dbfIds: number[]): any {
		return dbfIds.map((dbfId: number, i: number) => (
			<Minion dbfId={dbfId} key={i} />
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
		] as any;
	}
}

export default Overlay;
