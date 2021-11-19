import React from "react";
import styled from "styled-components";

interface Props {
	label: string;
	checked: boolean;
	disabled?: boolean;
	onChange: (checked: boolean) => void;
}

const Container = styled.div<{ disabled?: boolean }>`
	display: flex;
	color: rgba(255, 255, 255, ${(props) => (props.disabled ? 0.5 : 1)});
`;

const Box = styled.div<{ disabled?: boolean }>`
	display: flex;
	width: 20px;
	height: 20px;
	border-radius: 3px;
	align-items: center;
	justify-content: center;
	margin-right: 4px;
	background: rgba(255, 255, 255, ${(props) => (props.disabled ? 0.35 : 0.15)});
`;

export default class CheckBox extends React.Component<Props> {
	public render() {
		const { disabled, checked, label, onChange } = this.props;
		return (
			<Container
				onClick={() => !disabled && onChange(!checked)}
				disabled={disabled}
			>
				<Box disabled={disabled}>{checked ? "✔" : ""}</Box>
				{label}
			</Container>
		);
	}
}
