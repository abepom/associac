import React, { useState } from "react";
import {
	FlatList,
	Image,
	Keyboard,
	SafeAreaView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import { TextInput } from "react-native-paper";
import styles, { tema } from "../../assets/style/Style";
import Header from "../components/Header";
import images from "../utils/images";
import Alert from "../components/Alert";
import api from "../../services/api";
import Loading from "../components/Loading";
import Messages from "../components/Messages";

function Dependentes(props) {
	const { navigation } = props;
	const [matricula, setMatricula] = useState("");
	const [alerta, setAlerta] = useState({});
	const [carregando, setCarregando] = useState(false);
	const [associado, setAssociado] = useState({});
	const [mostrarDados, setMostrarDados] = useState(false);
	const [dependentes, setDependentes] = useState([]);

	const verificarMatricula = async () => {
		if (matricula !== "") {
			setCarregando(true);

			try {
				const { data } = await api.associados.get("/verificarMatricula", {
					cartao: `${matricula}00001`,
				});

				setAssociado(data);

				if (data.status) {
					const { data } = await api.associados.get("/listarDependentes", {
						cartao: `${matricula}00001`,
					});

					setDependentes(data.dependentes);
					setCarregando(false);
					setMostrarDados(true);
					Keyboard.dismiss();
				}
			} catch (error) {
				setCarregando(false);
				setDependentes([]);
				setMostrarDados(false);
				Keyboard.dismiss();

				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Ocorreu um erro ao listar os dependentes.",
					type: "danger",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
				});
			}
		} else {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "Para prosseguir é obrigatório informar a matrícula.",
				type: "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
			});
		}
	};

	return (
		<>
			<Header titulo="Buscar Dependentes" {...props} />
			<SafeAreaView style={{ flex: 1, zIndex: 100 }}>
				<View style={{ flex: 1, margin: 20 }}>
					<Text
						style={{
							textAlign: "center",
							marginTop: 10,
							marginBottom: 20,
							fontSize: 17,
						}}
					>
						Busque os dependentes de uma matrícula para seleção.
					</Text>
					<View style={{ flexDirection: "row" }}>
						<View style={{ flex: 1 }}></View>
						<View style={{ flex: 1, marginHorizontal: 5 }}>
							<TextInput
								label="Matrícula"
								value={matricula}
								mode="outlined"
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
						<View style={{ flex: 1 }}>
							<TouchableOpacity
								onPress={() => verificarMatricula()}
								style={[
									styles.linha,
									{
										justifyContent: "center",
										alignContent: "center",
										alignItems: "center",
										height: 55,
										backgroundColor: tema.colors.primary,
										marginTop: 8,
										borderRadius: 6,
									},
								]}
							>
								<Image
									source={images.buscar}
									style={{
										tintColor: "#fff",
										width: 20,
										height: 20,
										marginRight: 10,
									}}
								/>
								<Text style={{ color: "#fff", fontSize: 20 }}>BUSCAR</Text>
							</TouchableOpacity>
						</View>
						<View style={{ flex: 1 }}></View>
					</View>
					<View style={{ flex: 1, marginTop: 50 }}>
						{carregando ? (
							<View style={[styles.centralizado, { flex: 1 }]}>
								<Loading size={120} />
							</View>
						) : (
							<>
								{mostrarDados && (
									<>
										{associado.status ? (
											<>
												<View
													style={{
														width: "100%",
														backgroundColor: tema.colors.background,
														borderRadius: 6,
														padding: 20,
														marginBottom: 20,
														elevation: 2,
														flexDirection: "row",
													}}
												>
													<View style={{ flex: 1 }}>
														<Text style={{ fontWeight: "bold", fontSize: 20 }}>
															{associado.nome}
														</Text>
														{associado.tipo === "01" ? (
															<Text
																style={{
																	fontSize: 16,
																	color: tema.colors.verde,
																}}
															>
																ASSOCIADO ABEPOM
															</Text>
														) : (
															<Text
																style={{
																	fontSize: 16,
																	color: tema.colors.vermelho,
																}}
															>
																NÃO ASSOCIADO
															</Text>
														)}
													</View>
													<View style={{ flex: 1 }}>
														<Text style={{ fontSize: 16, textAlign: "right" }}>
															Nascimento: {associado.nascimento}
														</Text>
														<Text style={{ fontSize: 16, textAlign: "right" }}>
															{associado.email}
														</Text>
													</View>
												</View>
												<FlatList
													data={dependentes}
													keyExtractor={(item) => item.cont}
													numColumns={1}
													renderItem={({ item }) => {
														return (
															<TouchableOpacity
																onPress={() =>
																	navigation.navigate("AlterarTipoDependente", {
																		matricula,
																		dependente: item,
																	})
																}
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
																			fontSize: 16,
																			color: tema.colors.primary,
																		}}
																	>
																		TIPO: {item.tipo.toUpperCase()}
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
																		NASCIMENTO
																	</Text>
																	<Text
																		style={{
																			fontSize: 16,
																			color: tema.colors.primary,
																		}}
																	>
																		{item.data_nascimento}
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
																		source={images.seta}
																		style={{
																			width: 30,
																			height: 30,
																			tintColor: tema.colors.primary,
																		}}
																		tintColor={tema.colors.primary}
																	/>
																</View>
															</TouchableOpacity>
														);
													}}
												/>
											</>
										) : (
											<>
												<View style={{ flexDirection: "row" }}>
													<View style={{ flex: 1 }} />
													<View style={{ height: 100, flex: 3 }}>
														<Messages
															titulo={`ASSOCIADO NÃO ENCONTRADO`}
															subtitulo="A matrícula informada não pertence a nenhum associado cadastrado na ABEPOM."
															cor={tema.colors.vermelho}
															imagem={images.atencao}
														/>
													</View>
													<View style={{ flex: 1 }} />
												</View>
											</>
										)}
									</>
								)}
							</>
						)}
					</View>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default Dependentes;
