import * as React from "react";
import Overlay from "./Overlay";
import {
	BoardStateData,
	BoardStateMessage,
	EBSConfiguration,
	GameEndMessage,
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

	constructor(props: RootProps) {
		super(props);
		this.state = {
			boardState: null,
			hasError: false,
			config: {},
		};
		this.queue = new AsyncQueue();
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
			this.queue.delay = this.props.twitchExtContext.hlsLatencyBroadcaster;
		}
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

		const config: { config?: EBSConfiguration } =
			typeof message.config === "object" ? { config: message.config } : {};
		if (isOfType<BoardStateMessage>(message, "board_state")) {
			this.setState({
				boardState: message.data,
				...(config as any),
			});
		} else if (isOfType<GameEndMessage>(message, "game_end")) {
			this.setState({
				boardState: null,
				...(config as any),
			});
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
