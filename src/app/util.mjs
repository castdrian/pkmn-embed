export function resolveColor(color) {
	switch (color) {
	  case 'Black':
		return '#323232';
	  case 'Blue':
		return '#257cff';
	  case 'Brown':
		return '#a3501a';
	  case 'Gray':
		return '#969696';
	  case 'Green':
		return '#3eff4e';
	  case 'Pink':
		return '#ff65a5';
	  case 'Purple':
		return '#a63de8';
	  case 'Red':
		return '#ff3232';
	  case 'White':
		return '#e1e1e1';
	  case 'Yellow':
		return '#fff359';
	  default:
		return '#ff0000';
	}
}