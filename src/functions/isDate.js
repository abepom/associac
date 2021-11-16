export default function isDate(data) {
	if (Object.prototype.toString.call(data) === "[object Date]") {
		if (isNaN(data.getTime())) {
			return false;
		} else {
			return true;
		}
	} else {
		return false;
	}
}
