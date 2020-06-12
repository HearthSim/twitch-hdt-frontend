import React from "react";

const PortalContext = React.createContext<{ portal: HTMLElement | null }>({
	portal: null,
});
const { Provider: PortalProvider, Consumer: PortalConsumer } = PortalContext;

export { PortalContext, PortalProvider, PortalConsumer };
