import * as React from "react";
import ReactDOM from "react-dom";
import { getHearthstoneLocaleFromTwitchLocale } from "../../utils/cards";
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
				<Root
					locale={getHearthstoneLocaleFromTwitchLocale(query.language || "en")}
				/>
			)}
		</TwitchExtConsumer>
	</TwitchExtProvider>,
	rootElement,
);
