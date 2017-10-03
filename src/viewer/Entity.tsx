import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import { CardsProps, withCards } from "../utils/cards";
import Card from "./Card";
import { PortalProps, withPortal } from "../utils/portal";

const EntityDiv = styled.div`
	width: 100%;
	height: 100%;
	opacity: 0.5;
	background-color: blue;

	&:hover {
		background-color: orange;
	}
`;

interface EntityProps extends React.ClassAttributes<Entity> {
	dbfId: number | null;
	flipped?: boolean;
}

interface EntityState {
	isHovering?: boolean;
	x?: number | null;
	y?: number | null;
	width?: number | null;
}

class Entity extends React.Component<
	EntityProps & CardsProps & PortalProps,
	EntityState
> {
	ref: HTMLDivElement | null;

	constructor(props: EntityProps & CardsProps & PortalProps, context: any) {
		super(props, context);
		this.state = {
			isHovering: false,
			x: null,
			y: null,
			width: null,
		};
	}

	render() {
		if (!this.props.dbfId) {
			return null;
		}
		const card = this.props.cards.getByDbfId(this.props.dbfId);

		let tooltip = null;
		if (this.state.isHovering && this.props.portal && card && card.id) {
			tooltip = (ReactDOM as any).createPortal(
				<Card
					dbfId={this.props.dbfId}
					x={this.state.x || 0}
					y={this.state.y || 0}
					width={this.state.width || 0}
					flipped={this.props.flipped}
				/>,
				this.props.portal,
			);
		}

		return (
			<EntityDiv
				onMouseEnter={e => {
					let { clientX: x, clientY: y } = e;
					const rect = this.ref && this.ref.getBoundingClientRect();
					let width = null;
					if (rect) {
						x = rect.right - rect.width / 2;
						y = rect.bottom - rect.height / 2;
						width = rect.width;
					}

					this.setState({
						isHovering: true,
						x,
						y,
						width,
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
			</EntityDiv>
		);
	}
}

export default withPortal(withCards(Entity));
