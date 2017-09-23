import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import { CardsProps, withCards } from "../utils/cards";
import Card from "./Card";
import { PortalProps, withPortal } from "../utils/portal";

const MinionDiv = styled.div`
	width: 11vh;
	height: 15vh;
	margin: 0 0.51vw;
	clip-path: ellipse(50% 50% at 50% 50%);

	background-color: blue;
	color: black;
	display: flex;
	font-weight: bold;
	justify-content: center;
	flex-direction: column;

	&:hover {
		background-color: orange;
	}
`;

interface MinionProps extends React.ClassAttributes<Minion> {
	dbfId: number;
}

interface MinionState {
	isHovering?: boolean;
	x?: number | null;
	y?: number | null;
}

class Minion extends React.Component<
	MinionProps & CardsProps & PortalProps,
	MinionState
> {
	ref: HTMLDivElement | null;

	constructor(props: MinionProps & CardsProps & PortalProps, context: any) {
		super(props, context);
		this.state = {
			isHovering: false,
			x: null,
			y: null,
		};
	}

	render() {
		const card = this.props.cards.getByDbfId(this.props.dbfId);

		let tooltip = null;
		if (this.state.isHovering && this.props.portal && card && card.id) {
			tooltip = (ReactDOM as any).createPortal(
				<Card
					dbfId={this.props.dbfId}
					x={this.state.x || 0}
					y={this.state.y || 0}
				/>,
				this.props.portal,
			);
		}

		return (
			<MinionDiv
				onMouseEnter={e => {
					let { clientX, clientY } = e;
					const rect = this.ref && this.ref.getBoundingClientRect();
					if (rect) {
						clientX += rect.width - (clientX - rect.left);
						clientY = rect.bottom;
					}

					this.setState({
						isHovering: true,
						x: clientX,
						y: clientY,
					});
				}}
				onMouseLeave={() =>
					this.setState({
						isHovering: false,
						x: null,
						y: null,
					})}
				innerRef={(ref: HTMLDivElement | null) => (this.ref = ref)}
			>
				{tooltip}
			</MinionDiv>
		);
	}
}

export default withPortal(withCards(Minion));
