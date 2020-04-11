import * as React from "react";
import styled from "styled-components";
import { EBSConfiguration } from "../../../twitch-hdt";
import {
	DecklistPosition,
	Feature,
	hasFeature,
	setFeature,
} from "../../../utils/config";
import { Fieldset, Heading } from "../ConfigView/ConfigView";
import StreamPreview from "./Preview";

const VerticalList = styled.ul`
	padding-left: 0;
	list-style-type: none;

	& > li:not(:first-child) {
		margin-top: 10px;
	}
`;

const Row = styled.div<{ width?: string }>`
	display: flex;
	width: ${props =>
		typeof props.width !== "undefined" ? props.width : "100%"};
	flex-direction: row;

	& > * {
		flex: 1;
	}
`;

const FullWidthInput = styled.input`
	width: 100%;
`;

const ThinInput = styled.input`
	width: 6em;
`;

const Centered = styled.div<{ margin?: string }>`
	width: 100%;
	display: flex;
	justify-content: center;
	margin: ${props => (props.margin ? props.margin : "unset")};
`;

const Label = styled.label`
	display: block;
	font-weight: bold;
	line-height: 1em;
`;

interface Props {
	disabled: boolean;
	settings: EBSConfiguration | null;
	previewSettings: (settings: EBSConfiguration) => any;
	commitSettings: () => any;
	setSetting: (key: keyof EBSConfiguration, value: string) => any;
	isLive: boolean;
}

export default class OverlayAdmin extends React.Component<Props> {
	constructor(props: Props, context: any) {
		super(props, context);
		this.state = {
			horizontalGameOffset: null,
		};
	}

	public getHiddenFeatures(): number {
		const defaultHidden = 0;
		const proposedHidden =
			this.props.settings && !!this.props.settings.hidden
				? +this.props.settings.hidden
				: NaN;
		return !isNaN(proposedHidden) ? proposedHidden : defaultHidden;
	}

	public changeDecklistPosition = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		this.props.setSetting("deck_position", event.target
			.value as DecklistPosition);
	};

	public setFeature = (feature: Feature) => (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const hiddenFeatures = this.getHiddenFeatures();
		this.props.setSetting(
			"hidden",
			"" + setFeature(hiddenFeatures, feature, !event.target.checked),
		);
	};

	public setHorizontalGameOffset = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const target = event.target;
		const value: number = target ? +target.value : 0;
		this.props.previewSettings({ game_offset_horizontal: "" + value });
	};

	public commitHorizontalGameOffset = (event: any) => {
		this.props.commitSettings();
	};

	public resetHorizontalGameOffset = (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		this.props.setSetting("game_offset_horizontal", "" + 0);
	};

	public render(): React.ReactNode {
		let decklistPosition = DecklistPosition.TOP_LEFT;
		if (this.props.settings) {
			decklistPosition =
				(this.props.settings.deck_position as DecklistPosition) ||
				decklistPosition;
		}

		const hiddenFeatures = this.getHiddenFeatures();
		const tooltipsEnabled = !hasFeature(hiddenFeatures, Feature.TOOLTIPS);
		const decklistEnabled = !hasFeature(hiddenFeatures, Feature.DECKLIST);

		const hideTooltips = true;
		const horizontalGameOffset = this.props.settings
			? this.props.settings.game_offset_horizontal
			: "0";

		return (
			<Fieldset>
				{this.props.children}
				<Heading>Overlay</Heading>
				<p>Customize how the interactive overlay appears on your stream.</p>
				<StreamPreview hideTooltips={hideTooltips} />
				<Row>
					<div>
						<VerticalList>
							<li>
								<label>
									<input
										type="checkbox"
										checked={decklistEnabled}
										disabled={this.props.disabled}
										onChange={this.setFeature(Feature.DECKLIST)}
									/>{" "}
									Deck List
								</label>
							</li>
							{decklistEnabled ? (
								<li>
									<p style={{ fontStyle: "italic" }}>
										Viewers can see the cards remaining in your deck and copy
										the deck code. They can move or hide the deck for
										themselves.
										<br />
									</p>
									<Label as="span" style={{ marginBottom: "4px" }}>
										Default Position:
									</Label>
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
												checked={
													decklistPosition === DecklistPosition.TOP_RIGHT
												}
												disabled={!decklistEnabled || this.props.disabled}
												value={DecklistPosition.TOP_RIGHT}
												onChange={this.changeDecklistPosition}
											/>{" "}
											Top Right
										</label>
									</Row>
								</li>
							) : null}
							<li>
								<label>
									<input
										type="checkbox"
										checked={tooltipsEnabled}
										disabled={this.props.disabled}
										onChange={this.setFeature(Feature.TOOLTIPS)}
									/>{" "}
									Interactive Tooltips
								</label>
							</li>
							{tooltipsEnabled ? (
								<li
									style={{
										display: !hideTooltips ? "none" : undefined,
									}}
								>
									<p style={{ fontStyle: "italic" }}>
										Viewers can hover over Minions, Heroes, Hero Powers,
										Weapons, Secrets, Quests to view the full card.
									</p>
									<Label>
										Horizontal Offset:
										<FullWidthInput
											type="range"
											value={horizontalGameOffset || 0}
											onChange={this.setHorizontalGameOffset}
											onBlur={this.commitHorizontalGameOffset}
											onMouseUp={this.commitHorizontalGameOffset}
											disabled={this.props.disabled}
											step="0.1"
											min="-50"
											max="50"
										/>
									</Label>
									<Centered margin={"4px 0"}>
										<ThinInput
											type="number"
											value={horizontalGameOffset || 0}
											onChange={this.setHorizontalGameOffset}
											onBlur={this.commitHorizontalGameOffset}
											disabled={this.props.disabled}
											step="0.1"
											min="-50"
											max="50"
										/>
										<button
											type="reset"
											onClick={this.resetHorizontalGameOffset}
											disabled={this.props.disabled}
											style={{
												marginLeft: "4px",
											}}
										>
											Reset
										</button>
									</Centered>
								</li>
							) : null}
						</VerticalList>
					</div>
				</Row>
			</Fieldset>
		);
	}
}
