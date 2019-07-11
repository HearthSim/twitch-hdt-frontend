import React from "react";
import ReactDOM from "react-dom";
import {
	CardsProvider,
	getHearthstoneLocaleFromTwitchLocale,
} from "../../utils/cards";
import {
	TwitchExtConsumer,
	TwitchExtConsumerArgs,
	TwitchExtProvider,
} from "../../utils/twitch";
import Root from "./Root";

ga("create", "UA-81509238-9", "auto");
ga("set", "anonymizeIp", true);
ga("send", "pageview", "overlay");

const rootElement = document.getElementById("root");
ReactDOM.render(
	<TwitchExtProvider>
		<TwitchExtConsumer>
			{({ query }: TwitchExtConsumerArgs) => (
				<CardsProvider
					locale={getHearthstoneLocaleFromTwitchLocale(query.language || "en")}
				>
					<Root />
				</CardsProvider>
			)}
		</TwitchExtConsumer>
	</TwitchExtProvider>,
	rootElement,
);
