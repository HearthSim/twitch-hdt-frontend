import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { State } from "../../../state";
import { actionCreators } from "../../../actions";
import OverlayPreviewComponent from "./OverlayPreview";

const mapStateToProps = (state: State) => ({
	thumbnailUrl: state.twitch.stream ? state.twitch.stream.thumbnail_url : null,
	isLive: state.twitch.stream === null ? null : !!state.twitch.stream,
});

const mapDispatchToProps = (dispatch: Dispatch<State>) =>
	bindActionCreators(
		{
			refreshStreamData: actionCreators.refreshStreamData,
		},
		dispatch,
	);

const OverlayPreview = connect(mapStateToProps, mapDispatchToProps)(
	OverlayPreviewComponent,
);

export default OverlayPreview;
