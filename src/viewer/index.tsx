import React from "react";
import ReactDOM from "react-dom";
import { CardsProvider } from "../utils/cards";
import { TwitchExtProvider } from "../utils/twitch";
import Root from "./Root";

const rootElement = document.getElementById("root");
ReactDOM.render(
	<TwitchExtProvider>
		<CardsProvider>
			<Root />
		</CardsProvider>
	</TwitchExtProvider>,
	rootElement,
);
