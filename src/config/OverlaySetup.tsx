import * as React from "react";
import { DecklistPosition } from "../utils/config";
import StreamPreview from "./StreamPreview";
import { ErrorMessage, Fieldset, FieldsetShield, Heading } from "./Installer";
import styled from "styled-components";
import { withProps } from "../utils/styled";

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
}

interface OverlaySetupState {
	disableDecklist?: boolean;
	decklistPosition: DecklistPosition;
}

export default class OverlaySetup extends React.Component<
	OverlaySetupProps,
	OverlaySetupState
> {
	constructor(props: OverlaySetupProps, context: any) {
		super(props, context);
		this.state = {
			disableDecklist: false,
			decklistPosition: DecklistPosition.TOP_LEFT,
		};
	}

	changeDecklistPosition = (event: React.ChangeEvent<HTMLInputElement>) => {
		const target = event.target;
		this.setState({ decklistPosition: target.value as DecklistPosition });
	};

	render() {
		return (
			<Fieldset>
				{this.props.children}
				<Heading>Overlay</Heading>
				<p>Customize your interactive overlay on Twitch.</p>
				<StreamPreview
					position={
						!this.state.disableDecklist
							? this.state.decklistPosition
							: undefined
					}
				/>
				<Row>
					<div>
						<VerticalList>
							<li>
								<label>
									<input
										type="checkbox"
										checked={!this.state.disableDecklist}
										disabled={this.props.disabled}
										onChange={e => {
											this.setState({ disableDecklist: !e.target.checked });
										}}
									/>{" "}
									Show deck list
								</label>
								<p>
									Let's your viewers see the remaining cards in your deck, hover
									over single cards and copy your deck to their clipboard.
								</p>
							</li>
							<li>
								<Row width={"200px"}>
									<label>
										<input
											type="radio"
											checked={
												this.state.decklistPosition ===
												DecklistPosition.TOP_LEFT
											}
											disabled={
												this.state.disableDecklist || this.props.disabled
											}
											value={DecklistPosition.TOP_LEFT}
											onChange={this.changeDecklistPosition}
										/>{" "}
										Top left
									</label>
									<label>
										<input
											type="radio"
											checked={
												this.state.decklistPosition ===
												DecklistPosition.TOP_RIGHT
											}
											disabled={
												this.state.disableDecklist || this.props.disabled
											}
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
