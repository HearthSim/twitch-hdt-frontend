import PropTypes from "prop-types";
import React from "react";
import { SingleCardDetailsPayload } from "../hsreplaynet";
import {
	BoardStateData,
	BoardStateMessage,
	EBSConfiguration,
	FormatType,
	GameEndMessage,
	GameStartMessage,
	Message,
} from "../twitch-hdt";
import { TwitchExtProps, withTwitchExt } from "../utils/twitch";
import AsyncQueue from "./AsyncQueue";
import Overlay from "./Overlay";

interface Props {}

interface State {
	boardState: BoardStateData | null;
	config: EBSConfiguration;
	hasError: boolean;
	statistics: {
		[gameType: string]: {
			[dbfId: string]: SingleCardDetailsPayload;
		};
	};
}

class Root extends React.Component<Props & TwitchExtProps, State> {
	public queue: AsyncQueue<Message>;
	public timeout: number | null;

	constructor(props: Props, context: any) {
		super(props, context);
		this.state = {
			boardState: null,
			hasError: false,
			config: {},
			statistics: {},
		};
		this.queue = new AsyncQueue();
		this.timeout = null;
	}

	public static childContextTypes = {
		fetchStatistics: PropTypes.func,
	};

	public getChildContext(): any {
		return {
			fetchStatistics: async (
				dbfId: number | string,
				gameType: FormatType,
			): Promise<SingleCardDetailsPayload> => {
				const _dbfId = "" + dbfId;
				const _gameType =
					gameType === FormatType.FT_WILD ? "RANKED_WILD" : "RANKED_STANDARD";
				// cache lookup
				if (this.state.statistics[_gameType]) {
					const cached = this.state.statistics[_gameType][_dbfId];
					if (cached) {
						return cached;
					}
				}
				const params = [`card_id=${_dbfId}`, `GameType=${_gameType}`];
				const url = `https://hsreplay.net/analytics/query/single_card_details/?${params.join(
					"&",
				)}`;
				const response = await fetch(url, {
					mode: "cors",
					headers: new Headers({
						"X-Twitch-Extension-Version": APPLICATION_VERSION,
					}),
				});
				if (response.status !== 200) {
					throw new Error(`Unexpected status code "${response.status}"`);
				}
				const data = await response.json();
				const payload = data.series.data.ALL;
				// cache payload
				this.setState(prevState => ({
					...prevState,
					statistics: {
						...prevState.statistics,
						[_gameType]: {
							...prevState.statistics[_gameType],
							[_dbfId]: payload,
						},
					},
				}));
				return payload;
			},
		};
	}

	public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		this.setState({ hasError: true });
	}

	public componentDidMount(): void {
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

	public componentWillReceiveProps(
		nextProps: Readonly<Props & TwitchExtProps>,
		nextContext: any,
	): void {
		if (this.props.twitchExtContext) {
			this.queue.delay = this.props.twitchExtContext.hlsLatencyBroadcaster;
		}
	}

	public componentWillUnmount(): void {
		this.queue.unlisten(this.handleMessage);
	}

	public refreshTimeout(): void {
		if (this.timeout !== null) {
			window.clearTimeout(this.timeout);
		}
		this.timeout = window.setTimeout(() => {
			this.setState({ boardState: null });
			this.timeout = null;
		}, 120 * 1000);
	}

	public handleMessage = (message: Message) => {
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
				boardState,
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

	public render(): React.ReactNode {
		return (
			<Overlay
				boardState={this.state.boardState || null}
				config={this.state.config}
			/>
		);
	}
}

export default withTwitchExt(Root);
