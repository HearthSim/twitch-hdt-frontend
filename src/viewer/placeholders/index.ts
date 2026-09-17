import HeroPlaceholder from "./hero.png";
import HeroPowerPlaceholder from "./hero_power.png";
import MinionPlaceholder from "./minion.png";
import SpellPlaceholder from "./spell.png";
import WeaponPlaceholder from "./weapon.png";
import LocationPlaceholder from "./location.png";
import BattlegroundsMinionPlaceholder from "./bgs_minion.png";
import BattlegroundsHeroPowerPlaceholder from "./bgs_hero_power.png";
import BattlegroundsQuestRewardPlaceholder from "./bgs_quest_reward.png";
import BattlegroundsSpellPlaceholder from "./bgs_spell.png";
import BattlegroundsAnomalyPlaceholder from "./bgs_anomaly.png";
import BattlegroundsTrinketPlaceholder from "./bgs_trinket.png";

const getPlaceholder = (type: string, battlegrounds: boolean): string => {
	switch (("" + type).toUpperCase()) {
		case "SPELL":
			return SpellPlaceholder;
		case "WEAPON":
			return WeaponPlaceholder;
		case "LOCATION":
			return LocationPlaceholder;
		case "HERO":
			return HeroPlaceholder;
		case "HERO_POWER":
			if (battlegrounds) return BattlegroundsHeroPowerPlaceholder;
			return HeroPowerPlaceholder;
		case "BATTLEGROUNDS_QUEST_REWARD":
			return BattlegroundsQuestRewardPlaceholder;
		case "BATTLEGROUNDS_SPELL":
			return BattlegroundsSpellPlaceholder;
		case "BATTLEGROUNDS_ANOMALY":
			return BattlegroundsAnomalyPlaceholder;
		case "BATTLEGROUNDS_TRINKET":
			return BattlegroundsTrinketPlaceholder;
		default:
		case "MINION":
			if (battlegrounds) return BattlegroundsMinionPlaceholder;
			return MinionPlaceholder;
	}
};

export {
	getPlaceholder,
	MinionPlaceholder,
	SpellPlaceholder,
	HeroPlaceholder,
	WeaponPlaceholder,
};
