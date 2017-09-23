import MinionPlaceholder from "./minion.png";
import SpellPlaceholder from "./spell.png";
import WeaponPlaceholder from "./weapon.png";
import HeroPlaceholder from "./hero.png";

const getPlaceholder = (type: string): string => {
	switch (type) {
		case "SPELL":
			return SpellPlaceholder;
		case "WEAPON":
			return WeaponPlaceholder;
		case "HERO":
			return HeroPlaceholder;
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
