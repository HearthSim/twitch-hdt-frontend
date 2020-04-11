import * as clipboard from "clipboard-polyfill";
import * as React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { BoardStatePlayer } from "../../twitch-hdt";
import { CardsProps, withCards } from "../../utils/cards";
import { getCopiableDeck } from "../../utils/hearthstone";
import { PortalProps, withPortal } from "../../utils/portal";

const FallbackModal = styled.div`
	position: absolute;
	left: 50%;
	top: 50%;
	height: 50%;
	width: 70%;
	transform: translateX(-50%) translateY(-50%);
	display: flex;
	flex-direction: column;
	z-index: 1001;

	button {
		background: #315376;
		color: white;
		border: 0;
		height: 45px;
		text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
			1px 1px 0 #000;
		pointer-events: all;
		margin-top: 5px;
		font-weight: bold;

		&:active {
			background-color: #1c2f42;
			outline: none;
		}
	}
`;

const Shadow = styled.div`
	z-index: 1000;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.7);
	pointer-events: all;
`;

const TextArea = styled.textarea`
	width: 100%;
	height: 100%;
	pointer-events: all;
	user-select: text;

	&:focus {
		outline: none;
		overflow-y: scroll;
		overflow-x: hidden;
	}
`;

interface Props {
	onCopy?: () => any;
	timeout?: number;
	player: BoardStatePlayer;
}

interface State {
	copied?: boolean;
	showFallback?: boolean;
}

class CopyDeckButton extends React.Component<
	Props & CardsProps & PortalProps,
	State
> {
	public static defaultProps = {
		timeout: 3000,
	};

	private timeout: number | null = null;

	constructor(props: Props & CardsProps & PortalProps, context: any) {
		super(props, context);
		this.state = {
			copied: false,
			showFallback: false,
		};
	}

	public render(): React.ReactNode {
		let modal: React.ReactNode = null;
		if (this.state.showFallback && this.props.portal) {
			const focus = (element: HTMLTextAreaElement) => {
				element.setSelectionRange(0, element.value.length);
			};
			modal = ReactDOM.createPortal(
				<>
					<Shadow onClick={() => this.setState({ showFallback: false })} />
					<FallbackModal>
						<TextArea
							value={this.getDeckstring() || ""}
							readOnly={true}
							onFocus={e => {
								if (e.target) {
									focus(e.target);
								}
							}}
							onClick={e => {
								if (e.target) {
									focus(e.target as HTMLTextAreaElement);
								}
							}}
						/>
						<button onClick={() => this.setState({ showFallback: false })}>
							Done
						</button>
					</FallbackModal>
				</>,
				this.props.portal,
			);
		}
		return (
			<>
				<button onClick={this.onCopy}>
					{this.state.copied ? <>Copied!</> : <>Copy Deck</>}
				</button>
				{modal}
			</>
		);
	}

	private getDeckstring(): string | null {
		const { deck, hero } = this.props.player;
		if (!deck) {
			return null;
		}
		const { name, cards, format } = deck;
		if (!format || !cards || !hero) {
			return null;
		}
		return getCopiableDeck(cards, format, [hero], name);
	}

	private onCopy = () => {
		const toCopy = this.getDeckstring();
		if (toCopy === null) {
			return;
		}
		clipboard
			.writeText(toCopy)
			.then(() => {
				if (this.props.onCopy) {
					this.props.onCopy();
				}
				this.setState({ copied: true }, () => {
					this.setTimeout();
				});
			})
			.catch((error: any) => {
				this.setState({ showFallback: true });
			});
	};

	private clearTimeout() {
		if (this.timeout === null) {
			return;
		}
		window.clearTimeout(this.timeout);
		this.timeout = null;
	}

	private setTimeout() {
		this.clearTimeout();
		this.timeout = window.setTimeout(() => {
			this.setState({ copied: false });
		}, this.props.timeout);
	}
}

export default withPortal(withCards(CopyDeckButton));
