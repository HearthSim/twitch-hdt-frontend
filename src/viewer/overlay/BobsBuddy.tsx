import React from "react";
import styled from "styled-components";
import { WhenToShowBobsBuddy } from "../../utils/config";

const innerSeperatorStyle = "2px solid #404548";

const Wrapper = styled.div`
	display: inline-block;
	background: #23272a;
	border-radius: 0 0 3px 3px;
	width: 500px;
	max-width: 100%;
	overflow: hidden;
	border: 1px solid #141617;
	position: relative;
`;

const Stats = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	transition: height 0.5s;
	overflow: hidden;
	&:nth-of-type(2) {
		border-top: ${innerSeperatorStyle};
	}
`;

const Stat = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	padding: 0px 6px;
	background: #23272a;
	height: 100%;
	flex: 1;
`;

const LethalStat = styled(Stat)`
	background: #141617;
`;

const LeftBorderLethalStat = styled(LethalStat)`
	border-left: ${innerSeperatorStyle};
`;

const TierateStat = styled(Stat)`
	border-left: ${innerSeperatorStyle};
	border-right: ${innerSeperatorStyle};
`;

const CenteredText = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`;

interface LabelProps {
	color: string;
	opacity?: number;
}

const Label = styled.label<LabelProps>`
	font-size: 12px;
	padding: 2px;
	font-weight: 900;
	opacity: ${props => (props.opacity !== undefined ? props.opacity : 1)};
	color: ${props => props.color};
`;

const Message = styled.label`
	font-size: 13px;
	color: white;
	padding: 8px;
	background-color: #141617;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	top: 1rem;
	cursor: inherit;
`;

const Value = styled.span`
	color: white;
	font-weight: bold;
	font-size: 20px;
`;

enum SimulationState {
	WaitingForCombat = 1,
	OpponentSecrets = 2,
	TooFewSimulations = 3,
	UpdateRequired = 4,
	UnknownCards = 5,
	InCombat = 6,
	InNonFirstShoppingPhase = 7,
}

function simulationStateMessage(
	state: SimulationState,
	showDuringShopping: boolean,
	showDuringCombat: boolean,
): string {
	switch (state) {
		case SimulationState.WaitingForCombat:
			return "Waiting For Combat";
		case SimulationState.OpponentSecrets:
			return "Opponent Secrets Not Yet Supported";
		case SimulationState.TooFewSimulations:
			return "Didn't Complete Enough Simulations";
		case SimulationState.UpdateRequired:
			return "HDT Update Required";
		case SimulationState.UnknownCards:
			return "Found Unknown Cards";
		case SimulationState.InCombat:
			if (showDuringCombat) {
				return "Current Combat";
			}
			return "Waiting For Shopping";

		case SimulationState.InNonFirstShoppingPhase:
			if (showDuringShopping) {
				return "Previous Combat";
			}
			return "Waiting For Combat";
	}
}

function formatLikelihood(toFormat: number): string {
	const value = toFormat * 100;
	return (value % 1 === 0 ? value : value.toFixed(1)) + "%";
}

interface Props {
	simulationState: SimulationState;
	winRate: number;
	tieRate: number;
	lossRate: number;
	playerLethal: number;
	opponentLethal: number;
	moving?: boolean;
	layout: string;
	whenToShowStats: WhenToShowBobsBuddy;
	userSeesDuringShopping: boolean;
	userSeesDuringCombat: boolean;
	onMoveStart?: (e: React.MouseEvent<HTMLElement>) => void;
	onMoveEnd?: (e: React.MouseEvent<HTMLElement>) => void;
}

export default class BobsBuddy extends React.Component<Props> {
	public shouldComponentUpdate(
		nextProps: Readonly<Props>,
		nextContext: any,
	): boolean {
		return (
			nextProps.moving !== this.props.moving ||
			nextProps.onMoveStart !== this.props.onMoveStart ||
			nextProps.onMoveEnd !== this.props.onMoveEnd ||
			nextProps.simulationState !== this.props.simulationState ||
			nextProps.winRate !== this.props.winRate ||
			nextProps.tieRate !== this.props.tieRate ||
			nextProps.lossRate !== this.props.lossRate ||
			nextProps.playerLethal !== this.props.playerLethal ||
			nextProps.opponentLethal !== this.props.opponentLethal ||
			nextProps.whenToShowStats !== this.props.whenToShowStats ||
			nextProps.userSeesDuringShopping !== this.props.userSeesDuringShopping ||
			nextProps.userSeesDuringCombat !== this.props.userSeesDuringCombat ||
			nextProps.layout !== this.props.layout
		);
	}

	private showStats(): boolean {
		if (
			this.props.simulationState === SimulationState.InNonFirstShoppingPhase &&
			this.props.userSeesDuringShopping &&
			(this.props.whenToShowStats === WhenToShowBobsBuddy.All ||
				this.props.whenToShowStats === WhenToShowBobsBuddy.OnlyInShopping)
		) {
			return true;
		}
		if (
			this.props.simulationState === SimulationState.InCombat &&
			this.props.userSeesDuringCombat
		) {
			if (
				this.props.whenToShowStats === WhenToShowBobsBuddy.All ||
				this.props.whenToShowStats === WhenToShowBobsBuddy.OnlyInCombat
			) {
				return true;
			}
			return false;
		}
		return false;
	}

	public render() {
		const {
			simulationState,
			winRate,
			tieRate,
			lossRate,
			playerLethal,
			opponentLethal,
			layout,
		} = this.props;

		const showStats = this.showStats();

		return (
			<Wrapper
				onMouseDown={e => {
					if (e.button !== 0) {
						return;
					}
					this.props.onMoveStart && this.props.onMoveStart(e);
				}}
				onMouseUp={e => {
					this.props.onMoveEnd && this.props.onMoveEnd(e);
				}}
			>
				<Stats
					style={{
						height: showStats ? 55 : 0,
					}}
				>
					{showStats ? (
						<>
							{layout === "overlay" ? (
								<LethalStat>
									<Label color={"#8AC66E"} opacity={playerLethal > 0 ? 1 : 0.6}>
										LETHAL
									</Label>
									<Value>{formatLikelihood(playerLethal)}</Value>
								</LethalStat>
							) : null}

							<Stat>
								<Label color={"#8AC66E"}>WIN</Label>
								<Value>{formatLikelihood(winRate)}</Value>
							</Stat>
							<TierateStat>
								<Label color={"white"}>TIE</Label>
								<Value>{formatLikelihood(tieRate)}</Value>
							</TierateStat>
							<Stat>
								<Label color={"#C66E6E"}>LOSS</Label>
								<Value>{formatLikelihood(lossRate)}</Value>
							</Stat>
							{layout === "overlay" ? (
								<LethalStat>
									<Label
										color={"#C66E6E"}
										opacity={opponentLethal > 0 ? 1 : 0.6}
									>
										LETHAL
									</Label>
									<Value>{formatLikelihood(opponentLethal)}</Value>
								</LethalStat>
							) : null}
						</>
					) : null}
				</Stats>
				{layout === "mobile" ? (
					<Stats style={{ height: showStats ? 55 : 0 }}>
						<LethalStat>
							<Label color={"#8AC66E"} opacity={playerLethal > 0 ? 1 : 0.6}>
								LETHAL
							</Label>
							<Value>{formatLikelihood(playerLethal)}</Value>
						</LethalStat>
						<LeftBorderLethalStat>
							<Label color={"#C66E6E"} opacity={opponentLethal > 0 ? 1 : 0.6}>
								LETHAL
							</Label>
							<Value>{formatLikelihood(opponentLethal)}</Value>
						</LeftBorderLethalStat>
					</Stats>
				) : null}

				<Message
					style={{ borderTop: showStats ? innerSeperatorStyle : "none" }}
				>
					{simulationStateMessage(
						simulationState,
						this.props.userSeesDuringShopping,
						this.props.userSeesDuringCombat,
					)}
				</Message>
			</Wrapper>
		);
	}
}
