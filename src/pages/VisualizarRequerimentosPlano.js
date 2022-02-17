import React, { useState } from "react";
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Image,
	FlatList,
	Modal,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import { TextInput } from "react-native-paper";
import WebView from "react-native-webview";
import { tema } from "../../assets/style/Style";
import api from "../../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { useUsuario } from "../store/Usuario";
import images from "../utils/images";
import imagens from "../utils/images";
import PDFReader from "rn-pdf-reader-js";

function VisualizarRequerimentosPlano(props) {
	const [{ token }] = useUsuario();
	const [matricula, setMatricula] = useState("");
	const [requerimentos, setRequerimentos] = useState([]);
	const [link, setLink] = useState("");
	const [modal, setModal] = useState(false);
	const [carregar, setCarregar] = useState(false);
	const [carregarDocs, setCarregarDocs] = useState(false);

	async function listarRequerimentos() {
		setCarregarDocs(true);

		const { data } = await api({
			url: "/associados/listarRequerimentosPlanosDeSaude",
			method: "GET",
			params: { matricula },
			headers: { "x-access-token": token },
		});

		setRequerimentos(data.requerimentos);
		setCarregarDocs(false);
	}

	async function abrirRequerimento(arquivo) {
		setModal(true);
		setCarregar(true);

		const { data } = await api({
			url: "/visualizarArquivo",
			method: "POST",
			data: { matricula, arquivo },
			headers: { "x-access-token": token },
		});

		setLink(data.caminho);
		setCarregar(false);
	}

	return (
		<>
			<Header titulo={"Visualizar Requerimentos"} {...props} />
			<Modal animationType="fade" transparent={true} visible={modal} {...props}>
				<View
					style={{
						flex: 1,
						backgroundColor: "#000A",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<View
						style={{
							paddingVertical: 10,
							paddingHorizontal: 5,
							margin: 20,
							backgroundColor: "#fff",
							borderRadius: 9,
							shadowColor: "#000",
							shadowOffset: {
								width: 0,
								height: 2,
							},
							shadowOpacity: 0.25,
							shadowRadius: 3.84,
							elevation: 5,
							width: "95%",
							height: "90%",
						}}
					>
						{carregar ? (
							<Loading size={80} />
						) : (
							<>
								{link.split(".")[link.split(".").length - 1].toLowerCase() ===
								"pdf" ? (
									<PDFReader
										source={{
											uri: link,
										}}
									/>
								) : (
									<WebView
										source={{
											uri: link,
										}}
										style={{
											marginVertical: 10,
											backgroundColor: "#fff",
										}}
										textZoom={250}
										startInLoadingState={true}
										renderLoading={() => (
											<View
												style={{
													flex: 1,
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												<Loading size={80} />
											</View>
										)}
									/>
								)}
							</>
						)}
					</View>
					<TouchableOpacity
						onPress={() => setModal(false)}
						style={{
							width: 50,
							height: 50,
							borderRadius: 50,
							backgroundColor: tema.colors.primary,
							bottom: 15,
							padding: 10,
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Image
							source={imagens.fechar}
							style={{ width: 20, height: 20, tintColor: "#fff" }}
							tintColor={"#fff"}
						/>
					</TouchableOpacity>
				</View>
			</Modal>
			<SafeAreaView style={{ flex: 1, zIndex: 100 }}>
				<View style={{ flex: 1, margin: 20 }}>
					<Text style={{ textAlign: "center", fontSize: 15 }}>
						Informe a matrícula do associado abaixo para visualizar os
						requerimentos assinados.
					</Text>
					<View style={{ marginVertical: 15 }}>
						<View style={{ flexDirection: "row" }}>
							<View style={{ flex: 1 }}></View>
							<View style={{ flex: 1, marginHorizontal: 5 }}>
								<TextInput
									label="Matrícula"
									mode={"outlined"}
									value={matricula}
									theme={tema}
									keyboardType={"numeric"}
									maxLength={6}
									onChangeText={(text) => setMatricula(text)}
									render={(props) => (
										<TextInputMask
											{...props}
											type={"custom"}
											options={{
												mask: "999999",
											}}
										/>
									)}
								/>
							</View>
							<View>
								<TouchableOpacity
									onPress={() => listarRequerimentos()}
									style={{
										flexDirection: "row",
										backgroundColor: tema.colors.primary,
										marginTop: 5,
										padding: 18,
										borderRadius: 6,
										marginLeft: 5,
									}}
								>
									<Image
										source={imagens.buscar}
										style={{ width: 25, height: 25, tintColor: "#fff" }}
										tintColor={"#fff"}
									/>
									<Text style={{ color: "#fff", marginLeft: 10, fontSize: 15 }}>
										BUSCAR REQUERIMENTOS
									</Text>
								</TouchableOpacity>
							</View>
							<View style={{ flex: 1 }}></View>
						</View>
					</View>
					{requerimentos.length > 0 && (
						<>
							{carregarDocs ? (
								<Loading size={105} />
							) : (
								<FlatList
									data={requerimentos}
									keyExtractor={(item) => item.sequencia + "-" + item.cont}
									numColumns={1}
									renderItem={({ item, index }) => {
										return (
											<TouchableOpacity
												key={index}
												onPress={() => abrirRequerimento(item.local_documento)}
												style={{
													backgroundColor: "#fff",
													elevation: 1,
													borderRadius: 6,
													flexGrow: 1,
													marginVertical: 5,
													padding: 20,
													flexDirection: "row",
												}}
											>
												<View style={{ flex: 8 }}>
													<Text
														style={{
															fontSize: 20,
															color: tema.colors.primary,
														}}
													>
														{item.nome.toUpperCase()}
													</Text>
													<Text
														style={{
															fontSize: 18,
															color: tema.colors.primary,
														}}
													>
														DOCUMENTO: {item.nome_documento.toUpperCase()}
													</Text>
													<Text
														style={{
															fontSize: 15,
															color: tema.colors.primary,
														}}
													>
														COMPLEMENTO: {item.complemento_desc.toUpperCase()}
													</Text>
												</View>
												<View
													style={{
														flex: 2,
														justifyContent: "center",
														alignItems: "center",
													}}
												>
													<Text
														style={{
															fontSize: 16,
															color: tema.colors.primary,
														}}
													>
														INCLUÍDO EM
													</Text>
													<Text
														style={{
															fontSize: 16,
															color: tema.colors.primary,
														}}
													>
														{item.data_inclusao}
													</Text>
												</View>
												<View
													style={{
														flex: 1,
														justifyContent: "center",
														alignItems: "center",
													}}
												>
													<Image
														source={images.file}
														style={{
															width: 40,
															height: 40,
															tintColor: tema.colors.primary,
														}}
														tintColor={tema.colors.primary}
													/>
												</View>
											</TouchableOpacity>
										);
									}}
								/>
							)}
						</>
					)}
				</View>
			</SafeAreaView>
		</>
	);
}

export default VisualizarRequerimentosPlano;
