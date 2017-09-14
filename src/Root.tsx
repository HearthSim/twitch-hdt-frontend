import * as React from "react";
import HelloWorld from "./HelloWorld";

interface RootProps extends React.ClassAttributes<Root> {}

export default class Root extends React.Component<RootProps, {}> {
	render() {
		return (
			<div>
				<HelloWorld />
			</div>
		);
	}
}
