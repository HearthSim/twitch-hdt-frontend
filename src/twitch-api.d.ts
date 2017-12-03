export interface TwitchApiStream {
	id: string;
	user_id: string;
	game_id: string;
	community_ids: string[];
	type: "all" | "live" | "vodcast";
	title: string;
	viewer_count: number;
	started_at: string;
	language: string;
	thumbnail_url: string;
}
