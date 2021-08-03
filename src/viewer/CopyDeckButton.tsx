import * as React from "react";
import { useCallback, useContext, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import { BoardStateDeck, BoardStatePlayer } from "../twitch-hdt";
import { copyText } from "../utils/clipboard";
import { getDeckToCopy } from "../utils/hearthstone";
import { PortalContext } from "../utils/portal";

const FallbackModal = styled.div`
	position: absolute;
	left: 50%;
	top: 50%;
	width: 70%;
	transform: translateX(-50%) translateY(-50%);
	display: flex;
	flex-direction: column;
	max-width: 500px;
	z-index: 1001;

	button {
		background: #315376;
		color: white;
		cursor: pointer;
		border: 0;
		height: 45px;
		text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
			1px 1px 0 #000;
		pointer-events: all;
		margin-top: 0;
		font-weight: bold;

		&:active {
			background-color: #1c2f42;
			outline: none;
		}
	}
`;

const TextArea = styled.textarea`
	width: 100%;
	height: 100%;
	pointer-events: all;
	resize: vertical;
	user-select: text;

	&,
	&:hover,
	&:focus {
		outline: none;
		border: 0;
	}

	&:focus {
		overflow-y: scroll;
		overflow-x: hidden;
	}
`;

const selectAll = (element: HTMLTextAreaElement): void => {
	if (!element.value) {
		return;
	}
	element.setSelectionRange(0, element.value.length);
};

interface Props {
	deck: BoardStateDeck | null;
	timeout?: number;
	onCopy?: () => void;
}

export interface CopyDeckButtonChildProps {
	onClick: () => void;
	copied: boolean;
	disabled: boolean;
}

export type CopyDeckButtonChild = (foo: CopyDeckButtonChildProps) => void;

const CopyDeckButton: React.FC<Props> = ({
	deck,
	timeout = 3000,
	onCopy,
	children,
}) => {
	const [fallback, setFallback] = useState(false);
	const [copied, setCopied] = useState(false);
	const { portal } = useContext(PortalContext);

	const deckstring = useMemo<string | null>(() => {
		if (!deck) {
			return null;
		}
		const { name, cards, format, hero } = deck;
		if (!format || !cards || !hero) {
			return null;
		}
		return getDeckToCopy(cards, format, [hero], name);
	}, [deck]);

	const copy = useCallback(async () => {
		if (!deckstring) {
			return;
		}
		try {
			await copyText(deckstring);
			setCopied(true);
		} catch (e) {
			setFallback(true);
		}
		if (onCopy) {
			onCopy();
		}
	}, [deckstring]);

	return (
		<>
			{fallback && deckstring && portal
				? ReactDOM.createPortal(
						<FallbackModal
							onMouseDown={e => {
								e.stopPropagation();
							}}
							onClick={e => {
								e.stopPropagation();
							}}
						>
							<TextArea
								value={deckstring}
								readOnly={true}
								onFocus={e => {
									if (e.target) {
										selectAll(e.target);
									}
								}}
								onClick={e => {
									e.preventDefault();
									e.stopPropagation();
									if (e.target) {
										selectAll(e.target as HTMLTextAreaElement);
									}
								}}
								rows={8}
							/>
							<button
								onClick={e => {
									e.preventDefault();
									setFallback(false);
								}}
							>
								Done
							</button>
						</FallbackModal>,
						portal,
				  )
				: null}
			{(children as CopyDeckButtonChild)({
				onClick: copy,
				disabled: deckstring === null,
				copied,
			})}
		</>
	);
};

export default CopyDeckButton;
