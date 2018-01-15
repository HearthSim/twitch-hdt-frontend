import * as React from "react";
import Overlay from "./Overlay";
import {
	BoardStateData,
	BoardStateMessage,
	EBSConfiguration,
	GameEndMessage,
	GameStartMessage,
	Message,
} from "../twitch-hdt";
import AsyncQueue from "./AsyncQueue";
import { TwitchExtProps, withTwitchExt } from "../utils/twitch";

interface RootProps extends React.ClassAttributes<Root> {}

interface RootState {
	boardState: BoardStateData | null;
	config: EBSConfiguration;
	hasError: boolean;
}

class Root extends React.Component<RootProps & TwitchExtProps, RootState> {
	queue: AsyncQueue<Message>;
	timeout: number | null;

	constructor(props: RootProps, context?: any) {
		super(props);
		this.state = {
			boardState: null,
			hasError: false,
			config: {},
		};
		this.queue = new AsyncQueue();
		this.timeout = null;
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		this.setState({ hasError: true });
	}

	componentDidMount(): void {
		// setup the asynchronous queue
		this.queue.listen(this.handleMessage);

		// start listening to PubSub events
		window.Twitch.ext.listen(
			"broadcast",
			(target: string, contentType: string, message: string) => {
				// verify content type
				if (contentType !== "application/json") {
					console.debug(`Unexpected contentType "${contentType}"`);
					return;
				}

				// push into queue
				const m: Message = JSON.parse(message);
				this.queue.write(m, new Date().getTime());
			},
		);
	}

	componentWillReceiveProps(props: RootProps & TwitchExtProps) {
		if (this.props.twitchExtContext) {
			this.queue.delay = 0;
		}
	}

	componentWillUnmount(): void {
		this.queue.unlisten(this.handleMessage);
	}

	refreshTimeout(): void {
		if (this.timeout !== null) {
			window.clearTimeout(this.timeout);
		}
		this.timeout = window.setTimeout(() => {
			this.setState({ boardState: null });
			this.timeout = null;
		}, 120 * 1000);
	}

	handleMessage = (message: Message) => {
		this.refreshTimeout();

		const isOfType = <T extends Message>(
			message: Message,
			type: string,
		): message is T => {
			return message.type === type;
		};

		const config: { config?: EBSConfiguration } =
			typeof message.config === "object" ? { config: message.config } : {};
		if (isOfType<BoardStateMessage>(message, "board_state")) {
			const boardState = message.data;

			// 1.0 compatibility
			if (
				message.version === "1.0" &&
				boardState.player &&
				boardState.player.deck
			) {
				let cards: any = boardState.player.deck.cards;
				if (typeof cards === "object") {
					const dbfIds = Object.keys(cards);
					cards = dbfIds.map(Number).map((dbfId: number) => {
						const card: any = cards[dbfId];
						return [dbfId, card[0], card[1]];
					});
				}
				boardState.player.deck.cards = cards;
			}

			this.setState({
				boardState: boardState,
				...(config as any),
			});
		} else if (isOfType<GameEndMessage>(message, "game_end")) {
			this.setState({
				boardState: null,
				...(config as any),
			});
		} else if (isOfType<GameStartMessage>(message, "game_start")) {
			// do nothing
		} else {
			console.debug(`Unexpected message.type "${message.type}"`);
		}
	};

	render() {
		return (
			<Overlay
				boardState={this.state.boardState || null}
				config={this.state.config}
			/>
		);
	}
}

export default withTwitchExt(Root);
