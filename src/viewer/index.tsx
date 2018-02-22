import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import { CardsProvider } from "../utils/cards";
import { TwitchExtProvider } from "../utils/twitch";
import Root from "./Root";

const rootElement = document.getElementById("root");
const render = (Component: React.ComponentClass<any>) => {
	ReactDOM.render(
		<AppContainer>
			<TwitchExtProvider>
				<CardsProvider>
					<Component />
				</CardsProvider>
			</TwitchExtProvider>
		</AppContainer>,
		rootElement,
	);
};

render(Root);

if (module.hot) {
	module.hot.accept("./Root", () => {
		const nextRoot = (require("./Root") as any).default;
		render(nextRoot);
	});
}
