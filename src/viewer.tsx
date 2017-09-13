import * as React from "react";
import * as ReactDOM from "react-dom";
import {AppContainer} from "react-hot-loader";
import Root from "./Root";

const rootElement = document.getElementById("root");
const render = (Component: React.ComponentClass) => {
	ReactDOM.render(
		<AppContainer>
			<Component/>
		</AppContainer>,
		rootElement
	);
};

render(Root);

if (module.hot) {
	module.hot.accept("./Root", () => {
		const nextRoot = (require("./Root") as any).default;
		render(nextRoot);
	});
}
