import PropTypes from "prop-types";
import React from "react";
import { ChildContextProvider } from "react";
import { makeHOC } from "./hocs";

export interface TwitchExtProps {
	twitchExtContext?: TwitchExtContext;
}

interface Props {}

interface State {
	context: TwitchExtContext | null;
}

export class TwitchExtProvider extends React.Component<Props, State>
	implements ChildContextProvider<TwitchExtProps> {
	public static childContextTypes = {
		twitchExtContext: PropTypes.object,
	};

	constructor(props: Props, context: any) {
		super(props, context);
		this.state = {
			context: null,
		};
	}

	public getChildContext(): any {
		return { twitchExtContext: this.state.context };
	}

	public componentDidMount(): void {
		window.Twitch.ext.onContext(this.onContext);
	}

	public onContext = (
		context: TwitchExtContext,
		changed: (keyof TwitchExtContext)[],
	) => {
		this.setState(prevState => {
			const lastContext = prevState.context === null ? {} : prevState.context;
			return Object.assign({}, prevState, {
				context: Object.assign({}, lastContext, context),
			});
		});
	};

	public render(): React.ReactNode {
		return React.Children.only(this.props.children);
	}
}

export const withTwitchExt = makeHOC<TwitchExtProps>({
	twitchExtContext: PropTypes.object,
});
