import React from "react";
import { hot } from "react-hot-loader";
import PubSubListener, { PubSubListenerArgs } from "../PubSubListener";
import Overlay from "./Overlay";

interface Props {}

class Root extends React.Component<Props> {
	public render(): React.ReactNode {
		return (
			<PubSubListener>
				{({ boardState, config }: PubSubListenerArgs) => (
					<Overlay boardState={boardState} config={config} />
				)}
			</PubSubListener>
		);
	}
}

export default hot(module)(Root);
