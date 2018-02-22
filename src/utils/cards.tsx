import HearthstoneJSON, {
	CardData as HSJSONCard,
} from "hearthstonejson-client";
import PropTypes from "prop-types";
import React from "react";
import { makeHOC } from "./hocs";

export type CardDefinition = HSJSONCard;

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

	constructor() {
		this._cards = {};
	}

	public fetch(): Promise<void> {
		return new HearthstoneJSON().getLatest().then((c: CardDefinition[]) => {
			c
				.map(card => {
					if (card.dbfId) {
						this._cards[card.dbfId] = card;
					}
					return null;
				})
				.filter(x => x !== null);
		});
	}

	public getByDbfId(dbfId: number): CardDefinition | null {
		return this._cards[dbfId];
	}
}

interface Props {}

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
		const cards = new HearthstoneJSONCards();
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
