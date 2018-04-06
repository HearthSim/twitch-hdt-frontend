import clipboard from "clipboard-polyfill";
import React from "react";
import { BoardStatePlayer } from "../../twitch-hdt";
import { CardsProps, withCards } from "../../utils/cards";
import { getCopiableDeck } from "../../utils/hearthstone";

interface Props {
	onCopy?: () => any;
	timeout?: number;
	player: BoardStatePlayer;
}

interface State {
	copied?: boolean;
}

class CopyDeckButton extends React.Component<Props & CardsProps, State> {
	public static defaultProps = {
		timeout: 3000,
	};

	private timeout: number | null = null;

	constructor(props: Props & CardsProps, context: any) {
		super(props, context);
		this.state = {
			copied: false,
		};
	}

	public render(): React.ReactNode {
		return (
			<button onClick={this.onCopy}>
				{this.state.copied ? <>Copied!</> : <>Copy Deck</>}
			</button>
		);
	}

	private onCopy = () => {
		const { deck, hero } = this.props.player;
		if (!deck) {
			return;
		}
		const { name, cards, format } = deck;
		if (!format || !cards || !hero) {
			return;
		}
		const toCopy = getCopiableDeck(cards, format, [hero], name);
		clipboard.writeText(toCopy).then(() => {
			if (this.props.onCopy) {
				this.props.onCopy();
			}
			this.setState({ copied: true }, () => {
				this.setState({ copied: true });
				this.setTimeout();
			});
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

export default withCards(CopyDeckButton);
