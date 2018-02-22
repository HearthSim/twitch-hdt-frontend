import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import Root from "./components/Root";
import store from "./store";

const rootElement = document.getElementById("root");
const render = (Component: typeof Root) => {
	ReactDOM.render(
		<AppContainer>
			<Component store={store} />
		</AppContainer>,
		rootElement,
	);
};

render(Root);

if (module.hot) {
	module.hot.accept("./components/Root", () => {
		const nextRoot = (require("./components/Root") as any).default;
		render(nextRoot);
	});
}
