import PropTypes from "prop-types";
import { makeHOC } from "./hocs";

export interface PortalProps {
	portal: HTMLDivElement;
}

export const withPortal = makeHOC<PortalProps>({
	portal: PropTypes.object,
});
