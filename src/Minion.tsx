import * as React from "react";
import styled from "styled-components";
import { CardsProps, withCards } from "./utils/cards";

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

interface InternalMinionProps extends CardsProps, MinionProps {}

interface MinionState {
	isHovering?: boolean;
}

class Minion extends React.Component<InternalMinionProps, MinionState> {
	constructor(props: InternalMinionProps, context: any) {
		super(props, context);
		this.state = {
			isHovering: false,
		};
	}

	render() {
		const card = this.props.cards.getByDbfId(this.props.dbfId);

		return (
			<MinionDiv
				onMouseEnter={() => this.setState({ isHovering: true })}
				onMouseLeave={() => this.setState({ isHovering: false })}
			>
				{this.state.isHovering && card && card.id ? card.id : null}
			</MinionDiv>
		);
	}
}

export default withCards<MinionProps>(Minion);
