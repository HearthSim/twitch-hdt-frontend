import * as React from "react";
import {
	DecklistPosition,
	Feature,
	hasFeature,
	setFeature,
} from "../utils/config";
import StreamPreview from "./StreamPreview";
import { Fieldset, Heading } from "./Installer";
import styled from "styled-components";
import { withProps } from "../utils/styled";
import { EBSConfiguration } from "../twitch-hdt";

const VerticalList = styled.ul`
	padding-left: 0;
	list-style-type: none;

	& > li:not(:first-child) {
		margin-top: 10px;
	}
`;

const Row = withProps<any>()(styled.div)`
	display: flex;
	width: ${props => (typeof props.width !== "undefined" ? props.width : "100%")};
	flex-direction: row;

	& > * {
		flex: 1;
	}
`;

interface OverlaySetupProps extends React.ClassAttributes<OverlaySetup> {
	disabled?: boolean;
	working?: boolean;
	configuration: EBSConfiguration | null;
	setConfiguration: (configuration: EBSConfiguration) => void;
}

export default class OverlaySetup extends React.Component<OverlaySetupProps> {
	getHiddenFeatures(): number {
		const defaultHidden = 0;
		const proposedHidden =
			this.props.configuration && !!this.props.configuration.hidden
				? +this.props.configuration.hidden
				: NaN;
		return !isNaN(proposedHidden) ? proposedHidden : defaultHidden;
	}

	changeDecklistPosition = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setConfiguration({
			deck_position: event.target.value as DecklistPosition,
		});
	};

	setDecklist = (event: React.ChangeEvent<HTMLInputElement>) => {
		const hiddenFeatures = this.getHiddenFeatures();
		this.props.setConfiguration({
			hidden:
				"" +
				setFeature(hiddenFeatures, Feature.DECKLIST, !event.target.checked),
		});
	};

	render() {
		let decklistPosition = DecklistPosition.TOP_RIGHT;
		if (this.props.configuration) {
			decklistPosition =
				(this.props.configuration.deck_position as DecklistPosition) ||
				decklistPosition;
		}

		const hiddenFeatures = this.getHiddenFeatures();
		const decklistEnabled = !hasFeature(hiddenFeatures, Feature.DECKLIST);

		return (
			<Fieldset>
				{this.props.children}
				<Heading>Overlay</Heading>
				<p>Customize your interactive overlay on Twitch.</p>
				<StreamPreview
					position={decklistEnabled ? decklistPosition : undefined}
				/>
				<Row>
					<div>
						<VerticalList>
							<li>
								<label>
									<input
										type="checkbox"
										checked={decklistEnabled}
										disabled={this.props.disabled}
										onChange={this.setDecklist}
									/>{" "}
									Show deck list
								</label>
								<p>
									Lets your viewers see the remaining cards in your deck, hover
									over single cards and copy your deck to their clipboard.<br />
									Viewers can hide and move the deck list for themselves.
								</p>
							</li>
							<li>
								<Row width={"200px"}>
									<label>
										<input
											type="radio"
											checked={decklistPosition === DecklistPosition.TOP_LEFT}
											disabled={!decklistEnabled || this.props.disabled}
											value={DecklistPosition.TOP_LEFT}
											onChange={this.changeDecklistPosition}
										/>{" "}
										Top left
									</label>
									<label>
										<input
											type="radio"
											checked={decklistPosition === DecklistPosition.TOP_RIGHT}
											disabled={!decklistEnabled || this.props.disabled}
											value={DecklistPosition.TOP_RIGHT}
											onChange={this.changeDecklistPosition}
										/>{" "}
										Top right
									</label>
								</Row>
							</li>
						</VerticalList>
					</div>
				</Row>
			</Fieldset>
		);
	}
}
