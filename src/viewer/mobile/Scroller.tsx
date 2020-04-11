import * as React from "react";
import styled from "styled-components";

const ScrollBody = styled.div`
	height: 100%;
	overflow-y: scroll;
`;

interface Props {}

export default class Scroller extends React.Component<Props> {
	public render(): React.ReactNode {
		return <ScrollBody>{this.props.children}</ScrollBody>;
	}
}
