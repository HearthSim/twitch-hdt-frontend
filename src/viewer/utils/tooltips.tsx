import React from "react";

export const enum TooltipBehaviour {
	FULLSCREEN,
	ATTACHED,
}

export const { Provider, Consumer } = (React as any).createContext(
	TooltipBehaviour.ATTACHED,
);
