import * as React from "react";
import Overlay from "./Overlay";
import { BoardStateMessage, BoardStateData } from "./twitch-hdt";
import { CardsProvider } from "./utils/cards";
import AsyncQueue from "./AsyncQueue";

interface RootProps extends React.ClassAttributes<Root> {}

interface RootState {
	boardState?: BoardStateData | null;
	hasError?: boolean;
}

export default class Root extends React.Component<RootProps, RootState> {
	queue: AsyncQueue<BoardStateData>;
	boardStateUpdater: (c: BoardStateData) => void;

	constructor(props: RootProps) {
		super(props);
		this.state = {
			boardState: null,
			hasError: false,
		};
		this.queue = new AsyncQueue();
		this.boardStateUpdater = state => this.setState({ boardState: state });
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
		this.queue.listen(this.boardStateUpdater);

		// start listening to PubSub events and write to queue
		window.Twitch.ext.listen(
			"broadcast",
			(target: string, contentType: string, message: string) => {
				if (contentType !== "application/json") {
					console.debug(`Unexpected contentType "${contentType}"`);
					return;
				}

				const m: BoardStateMessage = JSON.parse(message);
				if (m.type !== "board_state") {
					console.debug(`Unexpected message.type "${m.type}"`);
					return;
				}

				this.queue.write(m.data, new Date().getTime());
			},
		);
	}

	componentWillUnmount(): void {
		this.queue.unlisten(this.boardStateUpdater);
	}

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
