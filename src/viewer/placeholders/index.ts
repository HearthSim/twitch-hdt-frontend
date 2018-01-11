import MinionPlaceholder from "./minion.png";
import SpellPlaceholder from "./spell.png";
import WeaponPlaceholder from "./weapon.png";
import HeroPlaceholder from "./hero.png";
import HeroPowerPlaceholder from "./hero_power.png";

const getPlaceholder = (type: string): string => {
	switch (("" + type).toUpperCase()) {
		case "SPELL":
			return SpellPlaceholder;
		case "WEAPON":
			return WeaponPlaceholder;
		case "HERO":
			return HeroPlaceholder;
		case "HERO_POWER":
			return HeroPowerPlaceholder;
		default:
		case "MINION":
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
