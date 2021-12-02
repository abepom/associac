export default function calculateAge(data) {
	let birthday = +new Date(data);
	return ~~((Date.now() - birthday) / 31557600000);
}
