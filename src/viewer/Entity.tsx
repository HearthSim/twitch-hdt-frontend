import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { CardsProps, withCards } from "../utils/cards";
import Card from "./Card";
import { PortalProps, withPortal } from "../utils/portal";
import CardStatistics from "./CardStatistics";
import PropTypes from "prop-types";

const EntityDiv = styled.div`
	width: 100%;
	height: 100%;
	cursor: inherit;
`;

interface Props {
	dbfId: number | null;
	flipped?: boolean;
	disabled?: boolean;
}

interface State {
	isHovering?: boolean;
	showStatistics?: boolean;
	x?: number | null;
	y?: number | null;
	width?: number | null;
}

class Entity extends React.Component<Props & CardsProps & PortalProps, State> {
	ref: HTMLDivElement | null = null;
	statisticsTimeout: number | null = null;

	constructor(props: Props & CardsProps & PortalProps, context: any) {
		super(props, context);
		this.state = {
			isHovering: false,
			showStatistics: false,
			x: null,
			y: null,
			width: null,
		};
	}

	static contextTypes = {
		statisticsContainer: PropTypes.func,
		gameType: PropTypes.number.isRequired,
	};

	public componentDidUpdate(
		prevProps: Readonly<Props & CardsProps & PortalProps>,
		prevState: Readonly<State>,
		prevContext: any,
	): void {
		if (
			prevState.isHovering !== this.state.isHovering &&
			this.statisticsTimeout !== null
		) {
			window.clearTimeout(this.statisticsTimeout);
		}
		if (!prevState.isHovering && this.state.isHovering) {
			this.statisticsTimeout = window.setTimeout(() => {
				this.statisticsTimeout = null;
				this.setState({ showStatistics: true });
			}, 500);
		}
		if (prevState.isHovering && !this.state.isHovering) {
			this.setState({ showStatistics: false });
		}
	}

	public render(): React.ReactNode {
		if (!this.props.dbfId) {
			return null;
		}
		const card = this.props.cards.getByDbfId(this.props.dbfId);

		let tooltip = null;
		let statistics = null;
		if (
			this.state.isHovering &&
			!this.props.disabled &&
			this.props.portal &&
			card &&
			card.id
		) {
			tooltip = ReactDOM.createPortal(
				<Card
					dbfId={this.props.dbfId}
					x={this.state.x || 0}
					y={this.state.y || 0}
					width={this.state.width || 0}
					flipped={this.props.flipped}
				/>,
				this.props.portal,
			);

			if (
				card.collectible &&
				this.context.statisticsContainer &&
				this.state.showStatistics
			) {
				const Container = this.context.statisticsContainer;
				statistics = ReactDOM.createPortal(
					<Container>
						<CardStatistics
							dbfId={this.props.dbfId}
							gameType={this.context.gameType}
						/>,
					</Container>,
					this.props.portal,
				);
			}
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
					})
				}
				innerRef={(ref: HTMLDivElement | null) => (this.ref = ref)}
			>
				{tooltip}
				{statistics}
				{this.props.children}
			</EntityDiv>
		);
	}
}

export default withPortal(withCards(Entity));
