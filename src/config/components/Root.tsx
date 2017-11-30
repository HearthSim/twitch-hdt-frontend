import * as React from "react";
import { Store, Provider } from "react-redux";
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
