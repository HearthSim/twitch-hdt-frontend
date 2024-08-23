import * as React from "react";
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
