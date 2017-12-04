import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import ConfigViewComponent from "./ConfigView";
import { State } from "../../state";
import { actionCreators } from "../../actions";
import { ConnectionStatus } from "../../enum";

const mapStateToProps = (state: State) => ({
	connectionStatus: state.connection.status,
	working:
		state.completingSetup ||
		state.connection.status === ConnectionStatus.UNKNOWN,
	settings: state.config.settings
		? Object.assign({}, state.config.settings, state.config.preview)
		: null,
	hasInitialized: state.hasInitialized,
});

const mapDispatchToProps = (dispatch: Dispatch<State>) =>
	bindActionCreators(
		{
			refreshConnectionStatus: actionCreators.updateConnectionStatus,
			refreshSettings: actionCreators.getSettings,
			setSetting: actionCreators.setSetting,
			setTwitchExtContext: actionCreators.setTwitchExtContext,
			setTwitchExtAuthorized: actionCreators.setTwitchExtAuthorized,
		},
		dispatch,
	);

const ConfigView = connect(mapStateToProps, mapDispatchToProps)(
	ConfigViewComponent,
);

export default ConfigView;
