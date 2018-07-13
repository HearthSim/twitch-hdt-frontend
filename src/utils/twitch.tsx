import PropTypes from "prop-types";
import React, { ChildContextProvider } from "react";
import { makeHOC } from "./hocs";

export interface TwitchExtProps {
	twitchExtContext?: TwitchExtContext;
	twitchExtVisibility?: boolean;
	twitchExtClientQueryParams?: TwitchExtClientQueryParams;
}

export interface TwitchExtConsumerArgs {
	context: TwitchExtContext | null;
	visible: boolean | null;
	query: Partial<TwitchExtClientQueryParams>;
}

const { Provider, Consumer } = React.createContext<TwitchExtConsumerArgs>({
	context: null,
	visible: null,
	query: {},
});

interface Props {}

interface State {
	context: TwitchExtContext | null;
	visible: boolean | null;
}

export class TwitchExtProvider extends React.Component<Props, State>
	implements ChildContextProvider<TwitchExtProps> {
	public static childContextTypes = {
		twitchExtContext: PropTypes.object,
		twitchExtVisibility: PropTypes.object,
		twitchExtClientQueryParams: PropTypes.object,
	};

	constructor(props: Props, context: any) {
		super(props, context);
		this.state = {
			context: null,
			visible: true,
		};
	}

	public getClientQueryParams(): Partial<TwitchExtClientQueryParams> {
		const { search } = window.location;
		return search.split("&").reduce((obj, param) => {
			const [key, value] = param.split("=", 2);
			return Object.assign({}, obj, { [key]: value });
		}, {});
	}

	public getChildContext(): any {
		return {
			twitchExtContext: this.state.context,
			twitchExtVisibility: this.state.visible,
			twitchExtClientQueryParams: this.getClientQueryParams(),
		};
	}

	public componentDidMount(): void {
		window.Twitch.ext.onContext(this.onContext);
		window.Twitch.ext.onVisibilityChanged(this.onVisibilityChanged);
	}

	public render(): React.ReactNode {
		return (
			<Provider
				value={{
					context: this.state.context,
					visible: this.state.visible,
					query: this.getClientQueryParams(),
				}}
			>
				{this.props.children}
			</Provider>
		);
	}

	private onContext = (
		context: TwitchExtContext,
		changed: (keyof TwitchExtContext)[],
	): void => {
		this.setState(prevState => {
			const lastContext = prevState.context === null ? {} : prevState.context;
			return Object.assign({}, prevState, {
				context: Object.assign({}, lastContext, context),
			});
		});
	};

	private onVisibilityChanged = (
		isVisible: boolean,
		context?: TwitchExtContext,
	): void => {
		this.setState(prevState => {
			return Object.assign(
				{},
				prevState,
				{ visible: isVisible },
				isVisible ? { context } : {},
			);
		});
	};
}

export { Consumer as TwitchExtConsumer };

export const withTwitchExt = makeHOC<TwitchExtProps>({
	twitchExtContext: PropTypes.object,
});
