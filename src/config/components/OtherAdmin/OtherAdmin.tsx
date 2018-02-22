import * as React from "react";
import { EBSConfiguration } from "../../../twitch-hdt";
import { Fieldset, Heading } from "../ConfigView/ConfigView";
import HSReplayNetLivePreview from "./hsreplaynet-live-preview.png";
import styled from "styled-components";

interface Props {
	disabled: boolean;
	settings: EBSConfiguration | null;
	setSetting: (key: keyof EBSConfiguration, value: any) => any;
}

const InstructionImage = styled.img`
	border: 1px solid gray;
	display: block;
	margin: 1em auto 1em auto;
`;

export default class OtherAdmin extends React.Component<Props> {
	public render(): React.ReactNode {
		const promoteStream =
			this.props.settings !== null
				? this.props.settings.promote_on_hsreplaynet
				: true;

		return (
			<Fieldset>
				{this.props.children}
				<Heading>Other</Heading>
				<label>
					<input
						type="checkbox"
						checked={promoteStream}
						disabled={this.props.disabled}
						onChange={event =>
							this.props.setSetting(
								"promote_on_hsreplaynet",
								event.target.checked,
							)
						}
					/>{" "}
					Allow my stream to appear on HSReplay.net{!promoteStream ? "…" : null}
				</label>
				{promoteStream ? (
					<>
						<InstructionImage
							src={HSReplayNetLivePreview}
							alt="HSReplay.net stream preview"
						/>
						<p>
							We'll show your stream on HSReplay.net based on the decks or cards
							you're playing.
						</p>
					</>
				) : null}
			</Fieldset>
		);
	}
}
