import React from "react";
import { Provider, Store } from "react-redux";
import { State } from "../state";
import ConfigView from "./ConfigView";

interface RootProps {
	store: Store<State>;
}

const Root: React.SFC<RootProps> = props => {
	return (
		<Provider store={props.store}>
			<ConfigView />
		</Provider>
	);
};

export default Root;
