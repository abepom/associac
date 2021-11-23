import { StyleSheet, Dimensions } from "react-native";

export const LARGURA_DEVICE = Dimensions.get("window").width;
export const ALTURA_DEVICE = Dimensions.get("window").height;

export const tema = {
	roundness: 2,
	colors: {
		primary: "#03254E",
		accent: "#114267",
		text: "#0f4064",
		background: "#ffffff",
		surface: "#fff",
		text: "#03254E",
		disabled: "#717171",
		placeholder: "#2A629A",
		backdrop: "rgba(52, 52, 52, 0.8)",
		verde: "#6CAC67",
		amarelo: "#d3c200",
		info: "#4da5db",
		vermelho: "#A32224",
		cinza: "#F0EEEF",
		separador: "#8D8C8D",
	},
};

const styles = StyleSheet.create({
	linha: {
		flexDirection: "row",
	},
	centralizado: {
		justifyContent: "center",
		alignItems: "center",
	},
	blocoScroll: {
		flex: 1,
		height: 110,
		backgroundColor: tema.colors.background,
		marginVertical: 5,
		borderRadius: 4,
		elevation: 1,
	},
	containerScroll: {
		flex: 1,
		width: "100%",
		maxHeight: "90%",
		marginVertical: 10,
	},
	containerTotal: {
		width: "100%",
		height: 50,
		bottom: 0,
		backgroundColor: tema.colors.primary,
	},
	textoTotal: {
		color: tema.colors.background,
	},
});

export default styles;
