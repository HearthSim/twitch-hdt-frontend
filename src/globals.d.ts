declare module "*.png" {
	const content: string;
	export default content;
}

declare module "*.svg" {
	const content: string;
	export default content;
}

declare module "*.otf" {
	const content: string;
	export default content;
}

declare const APPLICATION_VERSION: string;

declare module "deckstrings" {
	export function decode(deckString: string): object;
	export function encode(deck: object): string;
}
