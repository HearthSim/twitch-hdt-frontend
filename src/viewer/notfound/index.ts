import HeroPlaceholderNotFound from "./hero_not_found.png";
import HeroPowerPlaceholderNotFound from "./hero_power_not_found.png";
import MinionPlaceholderNotFound from "./minion_not_found.png";
import SpellPlaceholderNotFound from "./spell_not_found.png";
import WeaponPlaceholderNotFound from "./weapon_not_found.png";

const getNotFound = (type: string): string => {
	switch (("" + type).toUpperCase()) {
		case "SPELL":
			return SpellPlaceholderNotFound;
		case "WEAPON":
			return WeaponPlaceholderNotFound;
		case "HERO":
			return HeroPlaceholderNotFound;
		case "HERO_POWER":
			return HeroPowerPlaceholderNotFound;
		default:
		case "MINION":
			return MinionPlaceholderNotFound;
	}
};

export {
	getNotFound,
	MinionPlaceholderNotFound,
	SpellPlaceholderNotFound,
	HeroPlaceholderNotFound,
	WeaponPlaceholderNotFound,
};
