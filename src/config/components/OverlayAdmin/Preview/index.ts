import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { actionCreators, ActionTypes } from "../../../actions";
import { State } from "../../../state";
import OverlayPreviewComponent from "./OverlayPreview";

const mapStateToProps = (state: State) => ({
	thumbnailUrl: state.twitch.stream ? state.twitch.stream.thumbnail_url : null,
	settings: state.config.settings
		? Object.assign({}, state.config.settings, state.config.preview)
		: null,
	isLive: state.twitch.stream === null ? null : !!state.twitch.stream,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>) =>
	bindActionCreators(
		{
			refreshStreamData: actionCreators.refreshStreamData,
		},
		dispatch,
	);

const OverlayPreview = connect(
	mapStateToProps,
	mapDispatchToProps,
)(OverlayPreviewComponent);

export default OverlayPreview;
