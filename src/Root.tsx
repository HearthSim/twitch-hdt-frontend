import * as React from "react";
import Overlay from "./Overlay";
import { CardsProvider } from "./utils/cards";

interface RootProps extends React.ClassAttributes<Root> {}

interface RootState {
	hasError?: boolean;
}

export default class Root extends React.Component<RootProps, RootState> {
	constructor(props: RootProps) {
		super(props);
		this.state = {
			hasError: false,
		};
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		this.setState({ hasError: true });
	}

	render() {
		if (this.state.hasError) {
			return <p>hasError</p>;
		}
		return (
			<CardsProvider>
				<Overlay />
			</CardsProvider>
		);
	}
}
