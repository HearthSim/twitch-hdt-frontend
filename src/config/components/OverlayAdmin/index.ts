import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { actionCreators, ActionTypes } from "../../actions";
import { ConnectionStatus } from "../../enums";
import { State } from "../../state";
import OverlayAdminComponent from "./OverlayAdmin";

const mapStateToProps = (state: State) => ({
	disabled:
		state.connection.status !== ConnectionStatus.READY || state.config.readonly,
	isLive: state.twitch.stream === null ? null : !!state.twitch.stream,
	settings: state.config.settings
		? Object.assign({}, state.config.settings, state.config.preview)
		: null,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>) =>
	bindActionCreators(
		{
			commitSettings: actionCreators.commitSettings,
			previewSettings: actionCreators.previewSettings,
			refreshStreamData: actionCreators.refreshStreamData,
			setSetting: actionCreators.setSetting,
		},
		dispatch,
	);

const OverlayAdmin = connect(
	mapStateToProps,
	mapDispatchToProps,
)(OverlayAdminComponent);

export default OverlayAdmin;
