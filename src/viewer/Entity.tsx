import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { CardsProps, withCards } from "../utils/cards";
import { PortalProps, withPortal } from "../utils/portal";
import Card from "./Card";
import CardStatistics from "./CardStatistics";

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
	isMeaningfulHover?: boolean;
	x?: number | null;
	y?: number | null;
	width?: number | null;
}

class Entity extends React.Component<Props & CardsProps & PortalProps, State> {
	public static contextTypes = {
		gameType: PropTypes.number,
		statisticsContainer: PropTypes.func,
	};

	public ref: HTMLDivElement | null = null;
	public statisticsTimeout: number | null = null;
	public touchTimeout: number | null = null;

	constructor(props: Props & CardsProps & PortalProps, context: any) {
		super(props, context);
		this.state = {
			isHovering: false,
			isMeaningfulHover: false,
			width: null,
			x: null,
			y: null,
		};
	}

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
			this.statisticsTimeout = null;
		}
		if (!prevState.isHovering && this.state.isHovering) {
			this.statisticsTimeout = window.setTimeout(() => {
				this.statisticsTimeout = null;
				this.setState({ isMeaningfulHover: true });
			}, 500);
		}
		if (prevState.isHovering && !this.state.isHovering) {
			this.setState({ isMeaningfulHover: false });
		}
		if (
			this.state.isHovering &&
			!prevState.isMeaningfulHover &&
			this.state.isMeaningfulHover
		) {
			if (this.props.dbfId) {
				ga("send", "event", "Hover", "Card", String(this.props.dbfId));
			} else {
				ga("send", "event", "Hover", "Card");
			}
		}
	}

	public componentWillUnmount(): void {
		if (this.statisticsTimeout !== null) {
			window.clearTimeout(this.statisticsTimeout);
			this.statisticsTimeout = null;
		}
		this.clearTouchTimeout();
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
				this.context.gameType &&
				this.state.isMeaningfulHover
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
						width,
						x,
						y,
					});
				}}
				onMouseLeave={() => {
					this.setState({
						isHovering: false,
						x: null,
						y: null,
					});
				}}
				onTouchStart={this.onTouchStart}
				onTouchMove={() => {
					this.clearTouchTimeout();
					this.setState({
						isHovering: false,
					});
				}}
				onTouchEnd={(e: React.TouchEvent<HTMLDivElement>) => {
					e.preventDefault();
					this.clearTouchTimeout();
					this.setState({
						isHovering: false,
					});
				}}
				innerRef={(ref: HTMLDivElement | null) => (this.ref = ref)}
			>
				{tooltip}
				{statistics}
				{this.props.children}
			</EntityDiv>
		);
	}

	private clearTouchTimeout() {
		if (this.touchTimeout === null) {
			return;
		}
		window.clearTimeout(this.touchTimeout);
		this.touchTimeout = null;
	}

	private onTouchStart = (): void => {
		this.clearTouchTimeout();
		this.touchTimeout = window.setTimeout(() => {
			this.setState({
				isHovering: true,
			});
		}, 100);
	};
}

export default withPortal(withCards(Entity));
