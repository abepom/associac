import React, { useEffect, useState } from "react";
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Image,
	FlatList,
	Modal,
} from "react-native";
import WebView from "react-native-webview";
import s, { tema } from "../../assets/style/Style";
import api from "../../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { useUsuario } from "../store/Usuario";
import images from "../utils/images";
import PDFReader from "rn-pdf-reader-js";
import Messages from "../components/Messages";
import Documento from "../components/Documento";

function VisualizarRequerimentosPlano(props) {
	const [{ token, associado_atendimento }] = useUsuario();
	const [requerimentos, setRequerimentos] = useState([]);
	const [link, setLink] = useState("");
	const [modal, setModal] = useState(false);
	const [carregar, setCarregar] = useState(false);
	const [carregarDocs, setCarregarDocs] = useState(true);

	async function listarRequerimentos() {
		const { data } = await api({
			url: "/associados/listarRequerimentos",
			method: "GET",
			params: { matricula: associado_atendimento.matricula },
			headers: { "x-access-token": token },
		});

		setRequerimentos(data.requerimentos);
		setCarregarDocs(false);
	}

	useEffect(() => {
		listarRequerimentos();
	}, []);

	return (
		<>
			<Header titulo={"Visualizar Requerimentos"} {...props} />
			<Modal animationType="fade" transparent={true} visible={modal} {...props}>
				<View style={[s.fl1, s.bgcm, s.jcc, s.aic]}>
					<View
						style={[
							s.pdv10,
							s.pdh10,
							s.m20,
							s.bgcw,
							s.br9,
							s.smd,
							s.el5,
							s.w95p,
							s.h90p,
						]}
					>
						{carregar ? (
							<View style={[s.fl1, s.aic, s.jcc]}>
								<Loading size={120} />
							</View>
						) : link.split(".")[link.split(".").length - 1].toLowerCase() ===
						  "pdf" ? (
							<PDFReader source={{ uri: link }} />
						) : (
							<WebView
								source={{ uri: link }}
								style={[s.mv10, s.bgcw]}
								textZoom={250}
								startInLoadingState={true}
								renderLoading={() => (
									<View style={[s.fl1, s.jcc, s.aic]}>
										<Loading size={80} />
									</View>
								)}
							/>
						)}
					</View>
					<TouchableOpacity
						onPress={() => setModal(false)}
						style={[s.w50, s.h50, s.br50, s.bgcp, s.b15, s.pd10, s.jcc, s.aic]}
					>
						<Image
							source={images.fechar}
							style={[s.w20, s.h20, s.tcw]}
							tintColor={tema.colors.background}
						/>
					</TouchableOpacity>
				</View>
			</Modal>
			<SafeAreaView style={s.fl1}>
				<View style={[s.fl1, s.m20]}>
					{requerimentos.length > 0 && carregarDocs ? (
						<View style={[s.fl1, s.jcc, s.aic]}>
							<Loading size={120} />
						</View>
					) : (
						<>
							<FlatList
								data={requerimentos}
								keyExtractor={(item) => item.sequencia + "-" + item.cont}
								numColumns={1}
								ListEmptyComponent={
									<Messages
										titulo={"Nenhum Requerimento Cadastrado"}
										subtitulo={
											"Não há nenhum requerimento ou formulário cadastrado para esta matrícula."
										}
										imagem={images.info}
										cor={tema.colors.info}
									/>
								}
								renderItem={({ item, index }) => {
									return (
										<Documento
											item={item}
											setLink={setLink}
											setCarregar={setCarregar}
											setModal={setModal}
										/>
									);
								}}
							/>
							{requerimentos.length > 9 && (
								<View style={[s.row, s.jcc, s.aic, s.mv20]}>
									<Image
										source={images.seta}
										style={[s.w20, s.h20, s.tr90, , s.tcp]}
										tintColor={tema.colors.primary}
									/>
									<Text style={[s.fs15, s.ml10, s.fcp]}>
										ARRASTE PARA VER MAIS REQUERIMENTOS
									</Text>
								</View>
							)}
						</>
					)}
				</View>
			</SafeAreaView>
		</>
	);
}

export default VisualizarRequerimentosPlano;
