import * as React from "react";
import styled from "styled-components";

export type TextLayout = "minion" | "hero_power";

interface LayoutDefinition {
	/**
	 * The parchment, as fractions of the 512x776 render. Printed text can run almost its full width.
	 */
	box: { left: number; right: number; top: number; bottom: number };
	/**
	 * Hides the parts of the box that are covered by something else on the render.
	 */
	clipPath: string;
	/**
	 * Keeps the text clear of the clipped parts.
	 */
	padding: string;
	background: string;
	color: string;
	fontSizeOverHeight: number;
}

// the printed text is about 30px tall on a 776px render with 34px between lines
const LINE_HEIGHT = 34 / 30;
// Arial is wider than the card font, so it is set smaller to wrap like the printed text
const FONT_SIZE_OVER_HEIGHT = 24 / 776;

const LAYOUTS: Record<TextLayout, LayoutDefinition> = {
	minion: {
		box: { left: 0.1875, right: 0.175, top: 0.6, bottom: 0.165 },
		// the attack and health gems overlap the bottom corners of the parchment, so leave them showing
		clipPath:
			"polygon(0 0, 100% 0, 100% 66%, 96% 73%, 92.5% 85%, 90.5% 100%, " +
			"10.5% 100%, 8.5% 89%, 5% 78%, 0 71%)",
		padding: "0 4% 9%",
		background: "rgb(166, 149, 130)",
		color: "rgb(30, 23, 16)",
		fontSizeOverHeight: FONT_SIZE_OVER_HEIGHT,
	},
	hero_power: {
		// nothing overlaps this parchment, only its edges are frayed
		box: { left: 0.18, right: 0.185, top: 0.572, bottom: 0.215 },
		clipPath: "none",
		padding: "0 5%",
		background: "rgb(159, 137, 116)",
		color: "rgb(0, 0, 0)",
		// the lines are 36px apart instead of 34px
		fontSizeOverHeight: (FONT_SIZE_OVER_HEIGHT * 36) / 34,
	},
};
const MIN_FONT_SCALE = 0.5;
const FONT_SCALE_STEP = 0.9;

const TextBox = styled.div`
	position: absolute;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	border-radius: 0.4em;
	font-family: Arial, sans-serif;
	text-align: center;
	pointer-events: none;
`;

const Text = styled.p`
	margin: 0;
	line-height: ${LINE_HEIGHT};
	overflow-wrap: break-word;
`;

interface Props {
	/**
	 * Card text as HTML, see formatCardText.
	 */
	text: string;
	/**
	 * The rendered height of the card image, in pixels.
	 */
	height: number;
	/**
	 * Which kind of render the text is drawn over.
	 */
	layout: TextLayout;
}

interface State {
	fontScale: number;
}

/**
 * Replaces the printed text of a card render with custom text, e.g. that of an assembled minion.
 * Must be placed in a relatively positioned container that is the size of the card image.
 */
export default class AssembledCardText extends React.Component<Props, State> {
	private box: HTMLDivElement | null = null;

	constructor(props: Props) {
		super(props);
		this.state = { fontScale: 1 };
	}

	public componentDidMount(): void {
		this.shrinkToFit();
	}

	public componentDidUpdate(prevProps: Readonly<Props>): void {
		if (
			prevProps.text !== this.props.text ||
			prevProps.height !== this.props.height ||
			prevProps.layout !== this.props.layout
		) {
			if (this.state.fontScale !== 1) {
				this.setState({ fontScale: 1 });
				return;
			}
		}
		this.shrinkToFit();
	}

	public render(): React.ReactNode {
		const layout = LAYOUTS[this.props.layout];
		const fontSize =
			this.props.height * layout.fontSizeOverHeight * this.state.fontScale;
		return (
			<TextBox
				ref={(ref: HTMLDivElement | null) => (this.box = ref)}
				style={{
					left: `${layout.box.left * 100}%`,
					right: `${layout.box.right * 100}%`,
					top: `${layout.box.top * 100}%`,
					bottom: `${layout.box.bottom * 100}%`,
					padding: layout.padding,
					// cover the printed text
					backgroundColor: layout.background,
					clipPath: layout.clipPath,
					color: layout.color,
					fontSize,
				}}
			>
				<Text dangerouslySetInnerHTML={{ __html: this.props.text }} />
			</TextBox>
		);
	}

	// long assembled texts can exceed what the card printed, so shrink them until they fit
	private shrinkToFit(): void {
		const box = this.box;
		if (!box || this.state.fontScale <= MIN_FONT_SCALE) {
			return;
		}
		const text = box.firstElementChild as HTMLElement | null;
		const available =
			box.clientHeight - parseFloat(getComputedStyle(box).paddingBottom || "0");
		if (!text || text.scrollHeight <= available) {
			return;
		}
		this.setState({
			fontScale: Math.max(
				MIN_FONT_SCALE,
				this.state.fontScale * FONT_SCALE_STEP,
			),
		});
	}
}
