import { makeHOC } from "./hocs";
import * as PropTypes from "prop-types";
import * as React from "react";

export interface TwitchExtProps {
	twitchExtContext?: TwitchExtContext;
}

interface TwitchExtProviderProps
	extends React.ClassAttributes<TwitchExtProvider> {}

interface TwitchExtProviderState {
	context: TwitchExtContext | null;
}

export class TwitchExtProvider extends React.Component<
	TwitchExtProviderProps,
	TwitchExtProviderState
> {
	static childContextTypes = {
		twitchExtContext: PropTypes.object,
	};

	constructor(props: TwitchExtProviderProps, context: any) {
		super(props, context);
		this.state = {
			context: null,
		};
	}

	getChildContext() {
		return { twitchExtContext: this.state.context };
	}

	componentDidMount(): void {
		window.Twitch.ext.onContext(this.onContext);
	}

	onContext = (context: TwitchExtContext, changed: keyof TwitchExtContext) => {
		this.setState({ context });
	};

	render() {
		return React.Children.only(this.props.children);
	}
}

export const withTwitchExt = makeHOC<TwitchExtProps>({
	twitchExtContext: PropTypes.object,
});
