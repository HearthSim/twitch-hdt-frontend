import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";
import { BoardStateData, EBSConfiguration } from "../../twitch-hdt";
import { withProps } from "../../utils/styled";
import { TwitchExtProps, withTwitchExt } from "../../utils/twitch";
import { HSReplayNetIcon } from "../icons";
import { Provider, TooltipBehaviour } from "../utils/tooltips";
import CardList from "./CardList";
import CopyDeckButton from "./CopyDeckButton";
import Scroller from "./Scroller";

interface Props {
	boardState: BoardStateData | null;
	config: EBSConfiguration;
}

interface State {
	copied: boolean;
	timedOut: boolean;
	hadBoardState: boolean;
}

const PanelDiv = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	position: relative;
	overflow: hidden;
`;

const Portal = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
	z-index: 999;
	pointer-events: none;
	overflow: hidden;

	> * {
		pointer-events: none;
	}
`;

export interface ThemeProps {
	dark: boolean;
}

const Message = withProps<ThemeProps>()(styled.div)`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	color: ${(props: ThemeProps) => (props.dark ? "white" : "black")};
	background-color: ${(props: ThemeProps) => (props.dark ? "#141528" : "white")};

	> {
		h1 {
			font-size: 1.5em;
		}
	
		p, h1 {
			margin: 0.2em;
		}
	}
`;

const MessageFooter = withProps<ThemeProps>()(styled.footer)`
	display: flex;
	flex-direction: row;
	align-items: center;
	position: absolute;
	bottom: 0;
	right: 0;
	font-weight: bold;
	margin: 0.5em;
	
	img {
		height: 25px;
		margin-right: 0.4em;
		filter: ${(props: ThemeProps) =>
			!props.dark ? "invert(100%)" : "invert(0%)"}; 
	}
`;

const Header = styled.header`
	width: 100%;
	text-align: center;
	color: white;
	background: #315376;
	height: 45px;
	box-sizing: content-box;

	display: flex;
	flex-direction: row;
	align-items: center;
	border-bottom: solid 1px black;

	font-size: 0.85em;
	font-family: sans-serif;
	font-weight: bold;
	text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
		1px 1px 0 #000;
	white-space: nowrap;

	h1 {
		font-size: 1em;
		text-align: left;
		flex-grow: 1;
		padding: 0 6px 0 1px;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	button {
		height: 100%;
		margin: 0;
		color: white;
		background: #315376;
		text-align: center;
		font-size: 1em;
		border: 0;
		border-left: solid 1px black;
		font-weight: bold;
		padding: 0 1em;

		text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
			1px 1px 0 #000;

		&:active {
			background-color: #1c2f42;
			outline: none;
		}
	}
`;

const HeaderIcon = styled.img`
	box-sizing: border-box;
	height: 100%;
	filter: drop-shadow(-1px -1px 0 rgba(0, 0, 0, 0.5))
		drop-shadow(-1px 1px 0 rgba(0, 0, 0, 0.5))
		drop-shadow(1px -1px 0 rgba(0, 0, 0, 0.5))
		drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.5));
	padding: 8px 3px;
`;

class Panel extends React.Component<Props & TwitchExtProps, State> {
	public static getDerivedStateFromProps(
		nextProps: Props & TwitchExtProps,
		prevState: State,
	) {
		if (
			!!nextProps.boardState &&
			(!prevState.hadBoardState || prevState.timedOut)
		) {
			return { hadBoardState: true, timedOut: false };
		}
		return null;
	}

	public static childContextTypes = {
		portal: PropTypes.object,
	};

	private timeout: number | null = null;
	private portal: HTMLDivElement | null = null;

	constructor(props: Props & TwitchExtProps, context: any) {
		super(props, context);
		this.state = {
			copied: false,
			hadBoardState: !!props.boardState,
			timedOut: false,
		};
	}

	public componentDidMount(): void {
		if (!this.props.boardState) {
			this.setTimeout();
		}
	}

	public componentDidUpdate(
		prevProps: Readonly<Props & TwitchExtProps>,
		prevState: Readonly<State>,
		snapshot?: never,
	): void {
		if (this.props.boardState) {
			this.clearTimeout();
		}
	}

	public componentWillUnmount(): void {
		this.clearTimeout();
	}

	public render(): React.ReactNode {
		const player = this.props.boardState && this.props.boardState.player;
		const deck = player && player.deck;
		const isDark = this.props.twitchExtContext
			? this.props.twitchExtContext.theme === "dark"
			: false;

		if (!player || !deck || !deck.cards) {
			if (this.state.hadBoardState || this.state.timedOut) {
				return (
					<Message dark={isDark}>
						<h1>No deck available</h1>
						<p>There's no deck available right now.</p>
						<MessageFooter dark={isDark}>
							<img src={HSReplayNetIcon} /> HSReplay.net
						</MessageFooter>
					</Message>
				);
			}
			return <Message dark={isDark}>Loading…</Message>;
		}

		const title = deck.name || "HSReplay.net";

		return (
			<Provider value={TooltipBehaviour.FULLSCREEN}>
				<PanelDiv>
					<Portal innerRef={(ref: any) => (this.portal = ref)} />
					<Header>
						<HeaderIcon src={HSReplayNetIcon} />
						<h1>{title}</h1>
						<CopyDeckButton onCopy={this.onCopy} player={player}>
							{this.state.copied ? "Copied!" : "Copy Deck"}
						</CopyDeckButton>
					</Header>
					<Scroller>
						<CardList cardList={deck.cards} />
					</Scroller>
				</PanelDiv>
			</Provider>
		);
	}

	public getChildContext() {
		return {
			portal: this.portal,
		};
	}

	private clearTimeout(): void {
		if (this.timeout === null) {
			return;
		}
		window.clearTimeout(this.timeout);
		this.timeout = null;
	}

	private setTimeout(): void {
		this.clearTimeout();
		this.timeout = window.setTimeout(() => {
			this.setState({ timedOut: true });
		}, 30 * 1000);
	}

	private onCopy = () => {
		this.setState({ copied: true });
	};
}

export default withTwitchExt(Panel);
