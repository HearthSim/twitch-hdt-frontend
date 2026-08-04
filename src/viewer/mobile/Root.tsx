import * as React from "react";
import { hot } from "react-hot-loader";
import { CardsProvider } from "../../utils/cards";
import PubSubListener, { PubSubListenerArgs } from "../PubSubListener";
import Panel from "./Panel";

interface Props {
	locale: string;
}

class Root extends React.Component<Props> {
	public render(): React.ReactNode {
		return (
			<PubSubListener>
				{({ boardState, config, hearthstoneBuild }: PubSubListenerArgs) => (
					<CardsProvider locale={this.props.locale} build={hearthstoneBuild}>
						<Panel boardState={boardState} config={config} />
					</CardsProvider>
				)}
			</PubSubListener>
		);
	}
}

export default hot(module)(Root);
