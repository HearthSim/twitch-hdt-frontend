import { ThemedStyledFunction } from "styled-components";

/**
 * Wrapper around styled.<HTMLElement> to add custom props.
 */
export const withProps = <U extends {}>() => {
	return <P, T, O>(fn: ThemedStyledFunction<P, T, O>) =>
		fn as ThemedStyledFunction<P & U, T, O & U>;
};
