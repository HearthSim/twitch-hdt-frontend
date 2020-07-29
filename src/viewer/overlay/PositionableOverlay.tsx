import * as React from "react";
import styled from "styled-components";
import { OverlayPosition } from "../../utils/config";
import { TwitchExtProps, withTwitchExt } from "../../utils/twitch";
import { PositionProps } from "./Overlay";

const Wrapper = styled.div<{ active?: boolean; moveable: boolean }>`
	z-index: 100;
	position: absolute;
	height: 100vh;
	width: 100vw;
	overflow: hidden;
	pointer-events: ${props => (props.active ? "all" : "none")};
	cursor: ${props =>
		props.moveable ? (props.active ? "grabbing" : "grab") : "default"};
`;

const Overlay = styled.div<
	PositionProps & { position?: OverlayPosition; scale: number }
>`
	position: absolute;
	top: ${props =>
		props.position === OverlayPosition.TOP_CENTER ? 0 : props.top || "100px"};
	height: calc(100vh - ${props => props.top || "100px"} - 80px);
	overflow: visible;
	pointer-events: none;
	max-width: 100%;
	left: ${props =>
		props.position === OverlayPosition.TOP_LEFT
			? "10px"
			: props.position === OverlayPosition.TOP_CENTER
			? "50%"
			: "unset"};
	right: ${props =>
		props.position === OverlayPosition.TOP_RIGHT ? "-22rem" : "unset"};

	transform: ${props =>
		props.position === OverlayPosition.TOP_CENTER
			? `scale(${props.scale}) translateX(-50%) `
			: `scale(${props.scale})`};

	transform-origin: 0 0;

	> * > * {
		pointer-events: all;
	}
`;

interface Vector {
	x: number;
	y: number;
}

interface ChildProps {
	moving: boolean;
	onMoveStart: (e: React.MouseEvent<HTMLElement>) => void;
	onMoveEnd: (e: React.MouseEvent<HTMLElement>) => void;
}

interface Props {
	position: OverlayPosition;
	movable: boolean;
	engaged?: boolean;
	hidden?: boolean;
	children: (props: ChildProps) => React.ReactNode;
}

interface State {
	moving?: boolean;
	scale: number;
	moveStartPosition?: Vector | null;
	movePreviewOffset?: Vector | null;
	viewerOffset?: Vector | null;
}

class PositionableOverlay extends React.Component<
	Props & TwitchExtProps,
	State
> {
	public ref: HTMLDivElement | null = null;
	public copiedTimeout: number | null = null;

	constructor(props: Props & TwitchExtProps, context: any) {
		super(props, context);
		this.state = {
			movePreviewOffset: null,
			moveStartPosition: null,
			scale: 1,
			moving: false,
			viewerOffset: null,
		};
	}

	public onResize = (e: UIEvent) => {
		window.requestAnimationFrame(() => this.resize());
	};

	public componentDidMount() {
		window.addEventListener("resize", this.onResize);
		this.resize();
	}

	public componentWillUnmount() {
		window.removeEventListener("resize", this.onResize);
		this.clearTimeout();
	}

	public clearTimeout() {
		if (!this.copiedTimeout) {
			return;
		}
		window.clearTimeout(this.copiedTimeout);
		this.copiedTimeout = null;
	}

	public onMoveStart = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		const { clientX, clientY } = e;
		this.setState({
			moveStartPosition: { x: clientX, y: clientY },
			moving: true,
		});
	};

	public onMove = (e: React.MouseEvent<HTMLElement>) => {
		if (!this.state.moving || !this.props.movable) {
			return;
		}
		const { clientX, clientY } = e;
		if (!this.state.moveStartPosition) {
			return;
		}
		if (this.ref == null) {
			return;
		}
		const boundingRect = this.ref.getBoundingClientRect();
		const offsetX = clientX - this.state.moveStartPosition.x;
		const offsetY = clientY - this.state.moveStartPosition.y;
		this.setState({
			movePreviewOffset: {
				x: (100 * offsetX) / boundingRect.width,
				y: (100 * offsetY) / boundingRect.height,
			},
		});
	};

	public onMoveEnd = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		if (!this.state.moving) {
			return;
		}
		this.setState(state => ({
			movePreviewOffset: null,
			moving: false,
			viewerOffset: state.viewerOffset
				? state.movePreviewOffset
					? {
							x: state.movePreviewOffset.x + state.viewerOffset.x,
							y: state.movePreviewOffset.y + state.viewerOffset.y,
					  }
					: state.viewerOffset
				: state.movePreviewOffset,
		}));
	};

	public componentDidUpdate(
		prevProps: Readonly<Props & TwitchExtProps>,
		prevState: Readonly<State>,
		prevContext: any,
	): void {
		if (prevProps.position !== this.props.position) {
			this.setState({
				movePreviewOffset: null,
				moveStartPosition: null,
				moving: false,
				viewerOffset: null,
			});
		}
	}

	public resize() {
		if (!this.ref || !this.ref.parentElement) {
			return;
		}
		if (this.state.moving) {
			return;
		}
		const parent = this.ref.parentElement;
		const ownHeight = 1080;
		const { height: boundsHeight } = parent.getBoundingClientRect();
		const scale = Math.min(boundsHeight / ownHeight, 1);
		if (scale === this.state.scale) {
			return;
		}
		this.setState({ scale });
	}

	public render(): React.ReactNode {
		if (this.props.hidden) {
			return null;
		}
		let position = this.props.position;
		if (
			[
				OverlayPosition.TOP_LEFT,
				OverlayPosition.TOP_RIGHT,
				OverlayPosition.TOP_CENTER,
			].indexOf(position) === -1
		) {
			position = OverlayPosition.TOP_LEFT;
		}

		return (
			<Wrapper
				active={this.state.moving}
				onMouseMove={this.onMove}
				onMouseUp={this.onMoveEnd}
				ref={ref => (this.ref = ref)}
				moveable={this.props.movable}
			>
				<Overlay
					style={{
						marginLeft: `${(this.state.viewerOffset
							? this.state.viewerOffset.x
							: 0) +
							(this.state.movePreviewOffset
								? this.state.movePreviewOffset.x
								: 0)}vw`,
						marginTop: `${(this.state.viewerOffset
							? this.state.viewerOffset.y
							: 0) +
							(this.state.movePreviewOffset
								? this.state.movePreviewOffset.y
								: 0)}vh`,
					}}
					position={position}
					scale={this.state.scale}
				>
					{this.props.children({
						moving: !!this.state.moving,
						onMoveStart: this.onMoveStart,
						onMoveEnd: this.onMoveEnd,
					})}
				</Overlay>
			</Wrapper>
		);
	}
}

export default withTwitchExt(PositionableOverlay);
