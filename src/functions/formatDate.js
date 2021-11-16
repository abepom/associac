export default function formatDate(data, tipo) {
	data = data.toString();

	switch (tipo) {
		case "AMD":
		default:
			if (data.indexOf("-") > 0) {
				return data;
			} else {
				if (data.length > 8) {
					return (
						data.substring(6, 10) +
						"-" +
						data.substring(3, 5) +
						"-" +
						data.substring(0, 2)
					);
				} else {
					return (
						data.substring(4, 8) +
						"-" +
						data.substring(2, 4) +
						"-" +
						data.substring(0, 2)
					);
				}
			}
	}
}
