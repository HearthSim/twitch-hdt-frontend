import * as React from "react";
import {
	DecklistPosition,
	Feature,
	hasFeature,
	setFeature,
} from "../../../utils/config";
import StreamPreview from "./OverlayPreview";
import styled from "styled-components";
import { withProps } from "../../../utils/styled";
import { EBSConfiguration } from "../../../twitch-hdt";
import { Fieldset, Heading } from "../ConfigView/ConfigView";

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

interface OverlayAdminProps extends React.ClassAttributes<OverlayAdmin> {
	disabled: boolean;
	settings: EBSConfiguration | null;
	setSetting: (key: keyof EBSConfiguration, value: string) => any;
}

export default class OverlayAdmin extends React.Component<OverlayAdminProps> {
	getHiddenFeatures(): number {
		const defaultHidden = 0;
		const proposedHidden =
			this.props.settings && !!this.props.settings.hidden
				? +this.props.settings.hidden
				: NaN;
		return !isNaN(proposedHidden) ? proposedHidden : defaultHidden;
	}

	changeDecklistPosition = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.props.setSetting("deck_position", event.target
			.value as DecklistPosition);
	};

	setDecklist = (event: React.ChangeEvent<HTMLInputElement>) => {
		const hiddenFeatures = this.getHiddenFeatures();
		this.props.setSetting(
			"hidden",
			"" + setFeature(hiddenFeatures, Feature.DECKLIST, !event.target.checked),
		);
	};

	render() {
		let decklistPosition = DecklistPosition.TOP_RIGHT;
		if (this.props.settings) {
			decklistPosition =
				(this.props.settings.deck_position as DecklistPosition) ||
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
									Show Decklist
								</label>
								<p>
									Lets your viewers see the remaining cards in your deck, hover
									over single cards and copy your deck to their clipboard.<br />
									Viewers can hide and move the decklist for themselves.
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
										Top Left
									</label>
									<label>
										<input
											type="radio"
											checked={decklistPosition === DecklistPosition.TOP_RIGHT}
											disabled={!decklistEnabled || this.props.disabled}
											value={DecklistPosition.TOP_RIGHT}
											onChange={this.changeDecklistPosition}
										/>{" "}
										Top Right
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
