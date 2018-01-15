import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import OtherAdminComponent from "./OtherAdmin";
import { State } from "../../state";
import { actionCreators } from "../../actions";
import { ConnectionStatus } from "../../enums";

const mapStateToProps = (state: State) => ({
	disabled:
		state.connection.status !== ConnectionStatus.READY || state.config.readonly,
	settings: state.config.settings
		? Object.assign({}, state.config.settings, state.config.preview)
		: null,
});

const mapDispatchToProps = (dispatch: Dispatch<State>) =>
	bindActionCreators(
		{
			setSetting: actionCreators.setSetting,
		},
		dispatch,
	);

const OtherAdmin = connect(mapStateToProps, mapDispatchToProps)(
	OtherAdminComponent,
);

export default OtherAdmin;
