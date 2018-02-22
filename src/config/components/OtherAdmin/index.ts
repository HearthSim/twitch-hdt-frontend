import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { actionCreators } from "../../actions";
import { ConnectionStatus } from "../../enums";
import { State } from "../../state";
import OtherAdminComponent from "./OtherAdmin";

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
