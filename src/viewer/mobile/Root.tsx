import React from "react";
import { hot } from "react-hot-loader";
import PubSubListener from "../PubSubListener";
import Panel from "./Panel";

interface Props {}

class Root extends React.Component<Props> {
	public render(): React.ReactNode {
		return (
			<PubSubListener>
				{({ boardState, config }: any) => (
					<Panel boardState={boardState} config={config} />
				)}
			</PubSubListener>
		);
	}
}

export default hot(module)(Root);
