import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import Root from "./Root";
import { TwitchExtProvider } from "../utils/twitch";
import { CardsProvider } from "../utils/cards";

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
