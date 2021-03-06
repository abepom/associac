import { StyleSheet, Dimensions } from "react-native";

export const LARGURA_DEVICE = Dimensions.get("window").width;
export const ALTURA_DEVICE = Dimensions.get("window").height;

export const tema = {
	roundness: 5,
	colors: {
		primary: "#03254E",
		accent: "#114267",
		text: "#0f4064",
		background: "#ffffff",
		surface: "#fff",
		disabled: "#717171",
		placeholder: "#2A629A",
		backdrop: "rgba(52, 52, 52, 0.8)",
		verde: "#6CAC67",
		amarelo: "#d3c200",
		info: "#4da5db",
		vermelho: "#A32224",
		cinza: "#F0EEEF",
	},
};

const styles = StyleSheet.create({
	/* DISPLAY */
	row: { flexDirection: "row" },
	col: { flexDirection: "column" },
	flg1: { flexGrow: 1 },
	flb0: { flexBasis: 0 },
	/* ALINHAMENTO */
	jcc: { justifyContent: "center" },
	jcfe: { justifyContent: "flex-end" },
	jcfs: { justifyContent: "flex-start" },
	jcsb: { justifyContent: "space-between" },
	aic: { alignItems: "center" },
	aife: { alignItems: "flex-end" },
	acc: { alignContent: "center" },
	tac: { textAlign: "center" },
	tal: { textAlign: "left" },
	tar: { textAlign: "right" },
	tavb: { textAlignVertical: "bottom" },
	ofh: { overflow: "hidden" },
	/* FONTES */
	fs8: { fontSize: 8 },
	fs10: { fontSize: 10 },
	fs11: { fontSize: 11 },
	fs12: { fontSize: 12 },
	fs15: { fontSize: 15 },
	fs18: { fontSize: 18 },
	fs20: { fontSize: 20 },
	fs25: { fontSize: 25 },
	fcp: { color: tema.colors.primary },
	fcr: { color: tema.colors.vermelho },
	fcg: { color: tema.colors.verde },
	fcw: { color: "#ffffff" },
	bold: { fontWeight: "bold" },
	/* TAMANHOS */
	fl1: { flex: 1 },
	fl2: { flex: 2 },
	fl3: { flex: 3 },
	fl4: { flex: 4 },
	fl6: { flex: 6 },
	fl8: { flex: 8 },
	fl9: { flex: 9 },
	fl10: { flex: 10 },
	fl12: { flex: 12 },
	fullw: { width: "100%" },
	w40p: { width: "40%" },
	w70p: { width: "70%" },
	w90p: { width: "90%" },
	w95p: { width: "95%" },
	w10: { width: 10 },
	w20: { width: 20 },
	w25: { width: 25 },
	w32: { width: 32 },
	w35: { width: 35 },
	w38: { width: 38 },
	w40: { width: 40 },
	w50: { width: 50 },
	w60: { width: 60 },
	w70: { width: 70 },
	w80: { width: 80 },
	w200: { width: 200 },
	w250: { width: 250 },
	w400: { width: 400 },
	fullh: { height: "100%" },
	h90p: { height: "90%" },
	hauto: { height: "auto" },
	h1: { height: 1 },
	h10: { height: 10 },
	h20: { height: 20 },
	h25: { height: 25 },
	h32: { height: 32 },
	h35: { height: 35 },
	h38: { height: 38 },
	h40: { height: 40 },
	h50: { height: 50 },
	h60: { height: 60 },
	h70: { height: 70 },
	h80: { height: 80 },
	h100: { height: 100 },
	h150: { height: 150 },
	h200: { height: 200 },
	h250: { height: 250 },
	h300: { height: 300 },
	h400: { height: 400 },
	mxh200: { maxHeight: 200 },
	mxh300: { maxHeight: 300 },
	mxh340: { maxHeight: 340 },
	mxh90p: { maxHeight: "90%" },
	mih70: { minHeight: 70 },
	mih200: { minHeight: 200 },
	/* CORES */
	bgcp: { backgroundColor: tema.colors.primary },
	bgcib: { backgroundColor: "#031e3f" },
	bgcw: { backgroundColor: tema.colors.background },
	bgcg: { backgroundColor: tema.colors.verde },
	bgcm: { backgroundColor: "#000A" },
	bgcr: { backgroundColor: tema.colors.vermelho },
	bgca: { backgroundColor: tema.colors.amarelo },
	bgcd: { backgroundColor: tema.colors.disabled },
	/* POSICIONAMENTO */
	psa: { position: "absolute" },
	zit: { zIndex: 999999 },
	/* MARGENS E PADDINGS */
	m0: { margin: 0 },
	m4: { margin: 4 },
	m10: { margin: 10 },
	m20: { margin: 20 },
	mt5: { marginTop: 5 },
	mt8: { marginTop: 8 },
	mt10: { marginTop: 10 },
	mt20: { marginTop: 20 },
	mt40: { marginTop: 40 },
	mt50: { marginTop: 50 },
	mr5: { marginRight: 5 },
	mr10: { marginRight: 10 },
	mb5: { marginBottom: 5 },
	mb10: { marginBottom: 10 },
	mb20: { marginBottom: 20 },
	mb50: { marginBottom: 50 },
	ml5: { marginLeft: 5 },
	ml10: { marginLeft: 10 },
	mh5: { marginHorizontal: 5 },
	mh7: { marginHorizontal: 7 },
	mh20: { marginHorizontal: 20 },
	mv6: { marginVertical: 6 },
	mv10: { marginVertical: 10 },
	mv20: { marginVertical: 20 },
	mv25: { marginVertical: 25 },
	pd5: { padding: 5 },
	pd10: { padding: 10 },
	pd15: { padding: 15 },
	pd17: { padding: 17 },
	pd20: { padding: 20 },
	pd65: { padding: 65 },
	pdt5: { paddingTop: 5 },
	pdt7: { paddingTop: 7 },
	pdt20: { paddingTop: 20 },
	pdt35: { paddingTop: 35 },
	pdr5: { paddingRight: 5 },
	pdr10: { paddingRight: 10 },
	pdr20: { paddingRight: 20 },
	pdb20: { paddingBottom: 20 },
	pdl5: { paddingLeft: 5 },
	pdl10: { paddingLeft: 10 },
	pdl20: { paddingLeft: 20 },
	pdv10: { paddingVertical: 10 },
	pdh10: { paddingHorizontal: 10 },
	pdh20: { paddingHorizontal: 20 },
	t0: { top: 0 },
	t10: { top: 10 },
	b0: { bottom: 0 },
	b15: { bottom: 15 },
	b20: { bottom: 20 },
	b40: { bottom: 40 },
	l0: { left: 0 },
	l10: { left: 10 },
	l50: { left: 50 },
	r0: { right: 0 },
	r10: { right: 10 },
	r50: { right: 50 },
	/* BORDAS */
	br6: { borderRadius: 6 },
	br9: { borderRadius: 9 },
	br50: { borderRadius: 50 },
	btrr6: { borderTopRightRadius: 6 },
	bbrr6: { borderBottomRightRadius: 6 },
	bbw1: { borderBottomWidth: 1 },
	bbcc: { borderBottomColor: "#ccc" },
	bcp: { borderColor: tema.colors.primary },
	bw1: { borderWidth: 1 },
	el1: { elevation: 1 },
	el3: { elevation: 3 },
	el5: { elevation: 5 },
	/* IMAGENS */
	tcw: { tintColor: "#fff" },
	tcp: { tintColor: tema.colors.primary },
	tcr: { tintColor: tema.colors.vermelho },
	tcg: { tintColor: tema.colors.verde },
	tcc: { tintColor: tema.colors.disabled },
	tr90: { transform: [{ rotate: "90deg" }] },
	tr180: { transform: [{ rotateY: "180deg" }] },
	smd: {
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
});

export default styles;
