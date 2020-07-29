import React from "react";
import styled from "styled-components";
import CheckBox from "../../utils/CheckBox";
import { HSReplayNetIcon } from "../icons";
import { Icon } from "./DeckList";

const Wrapper = styled.ul`
	display: inline-block;
	background: #23272a;
	border-radius: 3px;
	border: 1px solid #141617;
	position: absolute;

	left: 0;
	top: 50%;

	z-index: 1;
	transform-origin: 0 0;
	transition: opacity 0.2s;

	overflow: hidden;
	padding-left: 0;
	list-style-type: none;
	margin: 0;
	padding: 10px;
	& > li:not(:first-child) {
		margin-top: 10px;
	}
`;

const SectionHeader = styled.label`
	font-size: 15px;
	font-weight: bold;
	display: flex;
	align-items: center;
	border-width: 100%;
	margin-bottom: 7px;
	color: white;
	white-space: nowrap;
	background: rgba(0, 0, 0, 0.2);
	margin: -10px -10px 0 -10px;
	padding: 10px;
	img {
		padding: 0;
		height: 20px;
		width: 20px;
		margin-right: 4px;
	}
`;

interface Props {
	show: boolean;
	enabled: boolean;
	showDuringCombat: boolean;
	showDuringShopping: boolean;
	onEnabledChanged: (enabled: boolean) => void;
	onShowDuringCombatChanged: (showDuringCombat: boolean) => void;
	onShowDuringShoppingChanged: (showDuringShopping: boolean) => void;
	streamerShowsDuringCombat: boolean;
	streamerShowsDuringShopping: boolean;
}

interface State {
	scale: number;
}

export default class BobsBuddyUserConfig extends React.Component<Props, State> {
	constructor(props: Props, context: any) {
		super(props, context);
		this.state = {
			scale: 1,
		};
	}

	public ref: HTMLUListElement | null = null;

	public onResize = (e: UIEvent) => {
		window.requestAnimationFrame(() => this.resize());
	};

	public componentDidMount() {
		window.addEventListener("resize", this.onResize);
		this.resize();
	}

	public componentWillUnmount() {
		window.removeEventListener("resize", this.onResize);
	}

	public resize() {
		if (!this.ref || !this.ref.parentElement) {
			return;
		}
		const {
			height: boundsHeight,
		} = this.ref.parentElement.getBoundingClientRect();
		const scale = Math.min(boundsHeight / 1080, 1);
		if (scale === this.state.scale) {
			return;
		}
		this.setState({ scale });
	}

	public render() {
		const { show } = this.props;

		return (
			<Wrapper
				style={{
					opacity: show ? 1 : 0,
					pointerEvents: show ? "all" : "none",
					transform: `scale(${this.state.scale}) translateY(-50%)`,
				}}
				ref={ref => (this.ref = ref)}
			>
				<li>
					<SectionHeader>
						<Icon
							src={HSReplayNetIcon}
							padding="4px"
							title="Powered by HSReplay.net"
						/>
						Bob's Buddy
					</SectionHeader>
				</li>
				<li>
					<CheckBox
						checked={this.props.enabled}
						onChange={this.props.onEnabledChanged}
						label={"Enabled"}
					/>
				</li>
				<li>
					<CheckBox
						checked={this.props.showDuringShopping}
						onChange={this.props.onShowDuringShoppingChanged}
						label={
							"Show During Shopping" +
							(this.props.streamerShowsDuringShopping ? "" : " (disabled)")
						}
						disabled={
							!this.props.enabled || !this.props.streamerShowsDuringShopping
						}
					/>
				</li>
				<li>
					<CheckBox
						checked={this.props.showDuringCombat}
						onChange={this.props.onShowDuringCombatChanged}
						label={
							"Show During Combat" +
							(this.props.streamerShowsDuringCombat ? "" : " (disabled)")
						}
						disabled={
							!this.props.enabled || !this.props.streamerShowsDuringCombat
						}
					/>
				</li>
			</Wrapper>
		);
	}
}
