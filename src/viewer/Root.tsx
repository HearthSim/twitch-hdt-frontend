import * as React from "react";
import Overlay from "./Overlay";
import {
	BoardStateData,
	BoardStateMessage,
	GameEndMessage,
	Message,
} from "../twitch-hdt";
import { CardsProvider } from "../utils/cards";
import AsyncQueue from "./AsyncQueue";

interface RootProps extends React.ClassAttributes<Root> {}

interface RootState {
	boardState: BoardStateData | null;
	hasError: boolean;
}

export default class Root extends React.Component<RootProps, RootState> {
	queue: AsyncQueue<Message>;

	constructor(props: RootProps) {
		super(props);
		this.state = {
			boardState: null,
			hasError: false,
		};
		this.queue = new AsyncQueue();
		window.Twitch.ext.onContext((context, changed) => {
			if (changed.indexOf("hlsLatencyBroadcaster") === -1) {
				return;
			}

			this.queue.delay = context.hlsLatencyBroadcaster;
		});
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

	componentWillUnmount(): void {
		this.queue.unlisten(this.handleMessage);
	}

	handleMessage = (message: Message) => {
		const isOfType = <T extends Message>(
			message: Message,
			type: string,
		): message is T => {
			return message.type === type;
		};

		if (isOfType<BoardStateMessage>(message, "board_state")) {
			this.setState({ boardState: message.data });
		} else if (isOfType<GameEndMessage>(message, "end_game")) {
			this.setState((prevState: RootState) => {
				if (!prevState.boardState) {
					return {};
				}
				return {
					boardState: {} as BoardStateData,
				};
			});
		} else {
			console.debug(`Unexpected message.type "${message.type}"`);
		}
	};

	render() {
		if (this.state.hasError) {
			return <p>hasError</p>;
		}
		return (
			<CardsProvider>
				<Overlay boardState={this.state.boardState || null} />
			</CardsProvider>
		);
	}
}
