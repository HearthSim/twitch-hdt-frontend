import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import OverlayAdminComponent from "./OverlayAdmin";
import { State } from "../../state";
import { ConnectionStatus } from "../../enum";
import { actionCreators } from "../../actions";

const mapStateToProps = (state: State) => ({
	disabled:
		state.connection.status !== ConnectionStatus.READY || state.config.readonly,
	settings: state.config.settings,
});

const mapDispatchToProps = (dispatch: Dispatch<State>) =>
	bindActionCreators(
		{
			setSetting: actionCreators.setSetting,
		},
		dispatch,
	);

const OverlayAdmin = connect(mapStateToProps, mapDispatchToProps)(
	OverlayAdminComponent,
);

export default OverlayAdmin;
