import { makeHOC } from "./hocs";
import * as PropTypes from "prop-types";

export interface PortalProps {
	portal: HTMLDivElement;
}

export const withPortal = makeHOC<PortalProps>({
	portal: PropTypes.object,
});
