import * as React from "react";

export const enum TooltipBehaviour {
	FULLSCREEN,
	ATTACHED,
}

export interface TooltipConsumerArgs {
	behaviour: TooltipBehaviour;
}

export const {
	Provider: TooltipProvider,
	Consumer: TooltipConsumer,
} = React.createContext<TooltipConsumerArgs>({
	behaviour: TooltipBehaviour.ATTACHED,
});
