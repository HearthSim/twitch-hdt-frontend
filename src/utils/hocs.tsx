import { ValidationMap } from "prop-types";
import * as React from "react";
import { capitalize } from "./strings";

/**
 * Use this method to create a simple HOC to directly extract some props from the context.
 */
export const makeHOC =
	<PInject extends {}>(contextTypes: ValidationMap<any>) =>
	<P extends {}>(
		Component: React.ComponentClass<P & PInject>,
	): React.ComponentClass<P> =>
		class GenericHOC extends React.Component<P> {
			public static displayName = `${Object.keys(contextTypes)
				.map(capitalize)
				.join("")}HOC`;
			public static contextTypes = contextTypes;

			public render(): React.ReactNode {
				const contextVars: { [k: string]: string } = {};
				for (const contextKey in contextTypes) {
					contextVars[contextKey] = this.context[contextKey];
				}
				Object.keys(contextTypes).map((k) => this.context[k]);
				const { children, ...props } = this.props as any;
				const newProps = Object.assign({}, contextVars, props);
				return React.createElement(Component, newProps, children);
			}
		};
