import * as React from "react";
import styled from "styled-components";
import Minion from "./Minion";
import { withProps } from "../utils/styled";
import { BoardStateData } from "../twitch-hdt";

interface OverlayProps extends React.ClassAttributes<Overlay> {
	boardState?: BoardStateData | null;
}

interface TopProps {
	top?: string;
}

const FullSize = styled.div`
	width: 100vw;
	height: 100vh;
	overflow: hidden;
`;

const Portal = styled.div`
	width: 100vw;
	height: 100vh;
	position: absolute;
`;

const Board = withProps<TopProps>()(styled.div)`
	width: 100vw;
	height: 15vh;
	opacity: 0.5;
	margin-top: ${(props: any) => props.top || "0px"};
	text-align: center;
	display: flex;
	-webkit-backface-visibility: hidden; // aliasing
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

	render() {
		const playerBoard = this.props.boardState
			? this.props.boardState.player_board.map((dbfId: number) => (
					<Minion dbfId={dbfId} />
				))
			: null;

		return [
			<Portal key="portal" innerRef={(ref: any) => (this.portal = ref)} />,
			<FullSize key="fullsize">
				<Board top={"29.75vh"}>
					{this.renderBoard(
						this.props.boardState ? this.props.boardState.opponent_board : [],
					)}
				</Board>
				<Board top={"2.5vh"} color={"red"}>
					{this.renderBoard(
						this.props.boardState ? this.props.boardState.player_board : [],
					)}
				</Board>
			</FullSize>,
		] as any;
	}
}

export default Overlay;
