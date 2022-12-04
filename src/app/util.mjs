export function resolveColor(color) {
	switch (color) {
	  case 'Black':
		return 0x323232;
	  case 'Blue':
		return 0x257cff;
	  case 'Brown':
		return 0xa3501a;
	  case 'Gray':
		return 0x969696;
	  case 'Green':
		return 0x3eff4e;
	  case 'Pink':
		return 0xff65a5;
	  case 'Purple':
		return 0xa63de8;
	  case 'Red':
		return 0xff3232;
	  case 'White':
		return 0xe1e1e1;
	  case 'Yellow':
		return 0xfff359;
	  default:
		return 0xff0000;
	}
}