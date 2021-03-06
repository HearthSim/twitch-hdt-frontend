import * as React from "react";
import ReactDOM from "react-dom";
import {
	CardsProvider,
	getHearthstoneLocaleFromTwitchLocale,
} from "../../utils/cards";
import "../../utils/gaInit";
import {
	TwitchExtConsumer,
	TwitchExtConsumerArgs,
	TwitchExtProvider,
} from "../../utils/twitch";
import Root from "./Root";

ga("create", "UA-81509238-9", {
	cookieFlags: "max-age=7200;secure;samesite=none",
});
ga("set", "anonymizeIp", true);
ga("send", "pageview", "/overlay.html");

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
