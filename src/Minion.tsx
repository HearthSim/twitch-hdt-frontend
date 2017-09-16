import * as React from "react";
import styled from "styled-components";

const MinionDiv = styled.div`
	width: 11vh;
	height: 15vh;
	color: white;
	background-color: blue;
	margin: 0 0.51vw;
	clip-path: ellipse(50% 50% at 50% 50%);

	&:hover {
		background-color: orange;
	}
`;

interface EntityProps extends React.ClassAttributes<Minion> {}

interface EntityState {
	isHovering?: boolean;
}

export default class Minion extends React.Component<EntityProps, EntityState> {
	constructor(props: EntityProps, context: any) {
		super(props, context);
		this.state = {
			isHovering: false,
		};
	}

	render() {
		return (
			<MinionDiv
				onMouseEnter={() => this.setState({ isHovering: true })}
				onMouseLeave={() => this.setState({ isHovering: false })}
			>
				{this.state.isHovering ? "hover" : null}
			</MinionDiv>
		);
	}
}
