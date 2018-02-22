import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { actionCreators } from "../../actions";
import { ConnectionStatus } from "../../enums";
import { State } from "../../state";
import OverlayAdminComponent from "./OverlayAdmin";

const mapStateToProps = (state: State) => ({
	disabled:
		state.connection.status !== ConnectionStatus.READY || state.config.readonly,
	settings: state.config.settings
		? Object.assign({}, state.config.settings, state.config.preview)
		: null,
	isLive: state.twitch.stream === null ? null : !!state.twitch.stream,
});

const mapDispatchToProps = (dispatch: Dispatch<State>) =>
	bindActionCreators(
		{
			setSetting: actionCreators.setSetting,
			previewSettings: actionCreators.previewSettings,
			commitSettings: actionCreators.commitSettings,
			refreshStreamData: actionCreators.refreshStreamData,
		},
		dispatch,
	);

const OverlayAdmin = connect(mapStateToProps, mapDispatchToProps)(
	OverlayAdminComponent,
);

export default OverlayAdmin;
