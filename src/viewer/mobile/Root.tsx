import React from "react";
import { hot } from "react-hot-loader";
import Listener from "../Listener";
import Panel from "./Panel";

interface Props {}

class Root extends React.Component<Props> {
	public render(): React.ReactNode {
		return (
			<Listener>
				{({ boardState, config }: any) => (
					<Panel boardState={boardState} config={config} />
				)}
			</Listener>
		);
	}
}

export default hot(module)(Root);
