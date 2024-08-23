import PropTypes from "prop-types";
import * as React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { BnetGameType } from "../twitch-hdt";
import { CardsProps, withCards } from "../utils/cards";
import { PortalConsumer } from "../utils/portal";
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

class Entity extends React.Component<Props & CardsProps, State> {
	public static contextTypes = {
		formatType: PropTypes.number,
		gameType: PropTypes.number,
		statisticsContainer: PropTypes.object,
	};

	public ref: HTMLDivElement | null = null;
	public statisticsTimeout: number | null = null;
	public touchTimeout: number | null = null;

	constructor(props: Props & CardsProps, context: any) {
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
		prevProps: Readonly<Props & CardsProps>,
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
	}

	public componentWillUnmount(): void {
		if (this.statisticsTimeout !== null) {
			window.clearTimeout(this.statisticsTimeout);
			this.statisticsTimeout = null;
		}
		this.clearTouchTimeout();
	}

	public render(): React.ReactNode {
		const { dbfId, disabled, flipped, cards, children } = this.props;
		const { x, y, width, isHovering, isMeaningfulHover } = this.state;

		if (!dbfId) {
			return null;
		}

		return (
			<PortalConsumer>
				{({ portal }) => {
					const card = cards.getByDbfId(dbfId);

					let tooltip = null;
					let statistics = null;
					if (isHovering && !disabled && portal && card && card.id) {
						tooltip = ReactDOM.createPortal(
							<Card
								dbfId={dbfId}
								x={x || 0}
								y={y || 0}
								width={width || 0}
								flipped={flipped}
								battlegrounds={
									this.context.gameType === BnetGameType.BGT_BATTLEGROUNDS &&
									(!card || card.type !== "HERO")
								}
							/>,
							portal,
						);

						if (
							card.collectible &&
							this.context.statisticsContainer &&
							this.context.formatType &&
							this.context.gameType !== BnetGameType.BGT_BATTLEGROUNDS &&
							isMeaningfulHover
						) {
							const Container = this.context.statisticsContainer;
							statistics = ReactDOM.createPortal(
								<Container>
									<CardStatistics
										dbfId={dbfId}
										formatType={this.context.formatType}
									/>
								</Container>,
								portal,
							);
						}
					}

					return (
						<EntityDiv
							onMouseEnter={(e) => {
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
							ref={(ref: HTMLDivElement | null) => (this.ref = ref)}
						>
							{tooltip}
							{statistics}
							{children}
						</EntityDiv>
					);
				}}
			</PortalConsumer>
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

export default withCards(Entity);
