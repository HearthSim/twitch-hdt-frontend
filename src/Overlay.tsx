import * as React from "react";
import styled from "styled-components";
import Minion from "./Minion";
import { withProps } from "./utils";

interface OverlayProps extends React.ClassAttributes<Overlay> {}

interface TopProps {
	top?: string;
}

const FullSize = styled.div`
	width: 100vw;
	height: 100vh;
	overflow: auto;
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

	render() {
		return [
			<Portal key="portal" innerRef={(ref: any) => (this.portal = ref)} />,
			<FullSize key="fullsize">
				<Board top={"29.75vh"}>
					<Minion />
				</Board>
				<Board top={"2.5vh"} color={"red"}>
					<Minion />
					<Minion />
					<Minion />
					<Minion />
					<Minion />
					<Minion />
					<Minion />
				</Board>
			</FullSize>,
		] as any;
	}
}

export default Overlay;
