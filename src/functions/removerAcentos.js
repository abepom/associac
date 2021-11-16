export default function removerAcentos(txt) {
	let dado = txt.toLowerCase();

	dado = dado.replace("á", "a");
	dado = dado.replace("ã", "a");
	dado = dado.replace("ã", "a");
	dado = dado.replace("ä", "a");
	dado = dado.replace("é", "e");
	dado = dado.replace("ê", "e");
	dado = dado.replace("ë", "e");
	dado = dado.replace("í", "i");
	dado = dado.replace("î", "i");
	dado = dado.replace("ó", "o");
	dado = dado.replace("õ", "o");
	dado = dado.replace("ô", "o");
	dado = dado.replace("ú", "u");
	dado = dado.replace("û", "u");
	dado = dado.replace("ü", "u");

	return dado;
}
