interface GA {
	l: number;
	q: any[];

	(command: "create", trackingId: string, options?: object): void;

	(
		command: "send",
		hitType: "event",
		eventCategory: string,
		eventAction: string,
		eventLabel?: string,
		eventValue?: number,
	): void;

	(command: "send", hitType: "pageview", page: string): void;

	(command: "set", hitType: "anonymizeIp", value: boolean): void;
}

declare var ga: GA;
