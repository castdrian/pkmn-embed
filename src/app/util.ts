export function resolveColor(color: string): string {
	switch (color) {
		case "Black":
			return "#323232";
		case "Blue":
			return "#257cff";
		case "Brown":
			return "#a3501a";
		case "Gray":
			return "#969696";
		case "Green":
			return "#3eff4e";
		case "Pink":
			return "#ff65a5";
		case "Purple":
			return "#a63de8";
		case "Red":
			return "#ff3232";
		case "White":
			return "#e1e1e1";
		case "Yellow":
			return "#fff359";
		default:
			return "#ff0000";
	}
}

export function typeWithUnicodeEmoji(type: string): string {
	switch (type) {
		case "Bug":
			return "Bug🦋";
		case "Dark":
			return "Dark🌙";
		case "Dragon":
			return "Dragon🐉";
		case "Electric":
			return "Electric⚡";
		case "Fairy":
			return "Fairy❤️";
		case "Fighting":
			return "Fighting🥊";
		case "Fire":
			return "Fire🔥";
		case "Flying":
			return "Flying🌪️";
		case "Ghost":
			return "Ghost👻";
		case "Grass":
			return "Grass🍃";
		case "Ground":
			return "Ground🌋";
		case "Ice":
			return "Ice❄️";
		case "Normal":
			return "Normal⚪";
		case "Poison":
			return "Poison☣️";
		case "Psychic":
			return "Psychic☯️";
		case "Rock":
			return "Rock🗿";
		case "Steel":
			return "Steel⚙️";
		case "Water":
			return "Water💧";
		default:
			return "Unknown";
	}
}
