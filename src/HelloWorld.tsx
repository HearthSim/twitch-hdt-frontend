import * as React from "react";

interface HelloWorldProps extends React.ClassAttributes<HelloWorld> {}

interface HelloWorldState {
	value?: string;
}

export default class HelloWorld extends React.Component<HelloWorldProps, HelloWorldState> {
	constructor(props: HelloWorldProps, context: any) {
		super(props, context);
		this.state = {
			value: "",
		}
	}

	render() {
		return <p>
			<input value={this.state.value} onChange={(e) => this.setState({value: e.target.value})}/>
		</p>;
	}
}
