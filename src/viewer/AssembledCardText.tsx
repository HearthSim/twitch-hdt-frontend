import * as React from "react";
import styled from "styled-components";

/**
 * The parchment of a minion render, as fractions of the 512x776 image. Printed text can run
 * almost its full width.
 */
const TEXT_BOX = {
	left: 0.1875,
	right: 0.175,
	top: 0.6,
	bottom: 0.165,
};

// the attack and health gems overlap the bottom corners of the parchment, so leave them showing
const GEM_CUTOUTS =
	"polygon(0 0, 100% 0, 100% 66%, 96% 73%, 92.5% 85%, 90.5% 100%, " +
	"10.5% 100%, 8.5% 89%, 5% 78%, 0 71%)";

// the printed text is about 30px tall on a 776px render with 34px between lines, but the
// fallback fonts are wider than the card font
const FONT_SIZE_OVER_HEIGHT = 26 / 776;
const LINE_HEIGHT = 34 / 30;
const MIN_FONT_SCALE = 0.5;
const FONT_SCALE_STEP = 0.9;

const TextBox = styled.div`
	position: absolute;
	left: ${TEXT_BOX.left * 100}%;
	right: ${TEXT_BOX.right * 100}%;
	top: ${TEXT_BOX.top * 100}%;
	bottom: ${TEXT_BOX.bottom * 100}%;
	box-sizing: border-box;
	/* keep the text above the gem cutouts */
	padding: 0 4% 9%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	/* cover the printed text */
	background-color: rgb(166, 149, 130);
	border-radius: 0.4em;
	clip-path: ${GEM_CUTOUTS};
	color: rgb(30, 23, 16);
	font-family: "Franklin Gothic Medium", "Franklin Gothic",
		"ITC Franklin Gothic", "Arial Narrow", Arial, sans-serif;
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
			prevProps.height !== this.props.height
		) {
			if (this.state.fontScale !== 1) {
				this.setState({ fontScale: 1 });
				return;
			}
		}
		this.shrinkToFit();
	}

	public render(): React.ReactNode {
		const fontSize =
			this.props.height * FONT_SIZE_OVER_HEIGHT * this.state.fontScale;
		return (
			<TextBox
				ref={(ref: HTMLDivElement | null) => (this.box = ref)}
				style={{ fontSize }}
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
