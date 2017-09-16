import * as React from "react";
import * as PropTypes from "prop-types";
import HearthstoneJSON, { CardData as HSJSONCard } from "hearthstonejson";
import { makeHOC } from "./hocs";

type Card = HSJSONCard & { dbfId: number }; // see HearthSim/npm-hearthstonejson#6

export interface CardsProps {
	cards: Cards;
}

export interface Cards {
	getByDbfId(dbfId: number): Card | null;
}

export class EmptyCards implements Cards {
	getByDbfId(dbfId: number): null {
		return null;
	}
}

export class HearthstoneJSONCards implements Cards {
	_cards: { [dbfId: number]: Card };

	constructor() {
		this._cards = {};
	}

	fetch(): Promise<void> {
		return new HearthstoneJSON().getLatest().then((c: Card[]) => {
			c.map(card => {
				this._cards[card.dbfId] = card;
			});
		});
	}

	getByDbfId(dbfId: number): Card | null {
		return this._cards[dbfId];
	}
}

interface CardsProviderProps extends React.ClassAttributes<CardsProvider> {}

interface CardsProviderState {
	cards?: Cards;
}

export class CardsProvider extends React.Component<
	CardsProviderProps,
	CardsProviderState
> {
	static childContextTypes = {
		cards: PropTypes.object.isRequired,
	};

	constructor(props: CardsProviderProps, context: any) {
		super(props, context);
		this.state = {
			cards: new EmptyCards(),
		};
	}

	getChildContext() {
		return { cards: this.state.cards };
	}

	componentDidMount(): void {
		const cards = new HearthstoneJSONCards();
		cards.fetch().then(() => this.setState({ cards }));
	}

	render() {
		return React.Children.only(this.props.children);
	}
}

export const withCards = makeHOC<CardsProps>({
	cards: PropTypes.object.isRequired,
});
