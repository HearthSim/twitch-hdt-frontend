import HearthstoneJSON, { CardData } from "hearthstonejson-client";
import PropTypes from "prop-types";
import * as React from "react";
import { HearthstoneLocale } from "react-hs-components/dist/components/Card";
import { makeHOC } from "./hocs";

export type CardDefinition = CardData;

export interface CardsProps {
	cards: Cards;
}

export interface Cards {
	getByDbfId(dbfId: number): CardDefinition | null;
}

export class EmptyCards implements Cards {
	public getByDbfId(dbfId: number): null {
		return null;
	}
}

export class HearthstoneJSONCards implements Cards {
	public _cards: { [dbfId: number]: CardDefinition };
	public _locale: string;

	constructor(locale: string) {
		this._cards = {};
		this._locale = locale;
	}

	public fetch(): Promise<void> {
		return new HearthstoneJSON()
			.getLatest(this._locale)
			.then((c: CardDefinition[]) => {
				c.map((card) => {
					if (card.dbfId) {
						this._cards[card.dbfId] = card;
					}
					return null;
				}).filter((x) => x !== null);
			});
	}

	public getByDbfId(dbfId: number): CardDefinition | null {
		return this._cards[dbfId];
	}
}

interface Props {
	locale: string;
}

interface State {
	cards?: Cards;
}

export class CardsProvider extends React.Component<Props, State> {
	public static childContextTypes = {
		cards: PropTypes.object.isRequired,
	};

	constructor(props: Props, context: any) {
		super(props, context);
		this.state = {
			cards: new EmptyCards(),
		};
	}

	public getChildContext() {
		return { cards: this.state.cards };
	}

	public componentDidMount(): void {
		const cards = new HearthstoneJSONCards(this.props.locale);
		cards.fetch().then(() => this.setState({ cards }));
	}

	public render(): React.ReactNode {
		return React.Children.only(this.props.children);
	}
}

export const withCards = makeHOC<CardsProps>({
	cards: PropTypes.object.isRequired,
});

export function isPlayableCard(card: CardDefinition) {
	const type = ("" + card.type).toUpperCase();
	const set = ("" + card.set).toUpperCase();
	if (type === "HERO") {
		return ["CORE", "HERO_SKINS"].indexOf(set) === -1;
	}
	return ["MINION", "SPELL", "WEAPON"].indexOf(type) !== -1;
}

export function sort(
	a: CardData | null,
	b: CardData | null,
	direction = 1,
): number {
	if (a !== null && b !== null) {
		if ((a.cost || 0) > ((b && b.cost) || 0)) {
			return direction;
		}
		if ((a.cost || 0) < (b.cost || 0)) {
			return -direction;
		}
		if ((a.name || "") > (b.name || "")) {
			return direction;
		}
		if ((a.name || "") < (b.name || "")) {
			return -direction;
		}
	} else {
		if (a !== null && b === null) {
			return direction;
		}
		if (a === null && b !== null) {
			return -direction;
		}
	}
	return 0;
}

export function getHearthstoneLocaleFromTwitchLocale(
	twitchLocale: string,
): HearthstoneLocale {
	switch (twitchLocale) {
		case "de":
			return "deDE";
		case "es":
			return "esES";
		case "es-mx":
			return "esMX";
		case "fr":
			return "frFR";
		case "it":
			return "itIT";
		case "ja":
			return "jaJP";
		case "ko":
			return "koKR";
		case "pl":
			return "plPL";
		case "pt":
		case "pt-br":
			return "ptBR";
		case "ru":
			return "ruRU";
		case "th":
			return "thTH";
		case "en":
		case "en-gb":
		default:
			return "enUS";
	}
}
