import React from "react";
import ReactDOM from "react-dom";
import { CardsProvider } from "../../utils/cards";
import { TwitchExtProvider } from "../../utils/twitch";
import Root from "./Root";

const rootElement = document.getElementById("root");
ReactDOM.render(
	<TwitchExtProvider>
		<CardsProvider locale="enUS">
			<Root />
		</CardsProvider>
	</TwitchExtProvider>,
	rootElement,
);
