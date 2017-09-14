import * as React from "react";
import styled from "styled-components";

interface HelloWorldProps extends React.ClassAttributes<HelloWorld> {}

interface HelloWorldState {
	value?: string;
}

const Title = styled.h1`
	font-size: 1.5em;
	text-align: center;
	color: red;
`;

export default class HelloWorld extends React.Component<
	HelloWorldProps,
	HelloWorldState
> {
	constructor(props: HelloWorldProps, context: any) {
		super(props, context);
		this.state = {
			value: "",
		};
	}

	render() {
		return (
			<div>
				<Title>Testing styled components</Title>
				<input
					value={this.state.value}
					onChange={e => this.setState({ value: e.target.value })}
				/>
			</div>
		);
	}
}
