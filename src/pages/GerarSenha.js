import React, { useState } from "react";
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Image,
	Keyboard,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import { TextInput } from "react-native-paper";
import styles, { tema } from "../../assets/style/Style";
import api from "../../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Messages from "../components/Messages";
import images from "../utils/images";
import Alert from "../components/Alert";
import { useUsuario } from "../store/Usuario";

function GerarSenha(props) {
	const { navigation } = props;
	const [{ token }] = useUsuario();
	const [matricula, setMatricula] = useState("");
	const [associado, setAssociado] = useState({});
	const [carregando, setCarregando] = useState(false);
	const [mostrarDados, setMostrarDados] = useState(false);
	const [alerta, setAlerta] = useState({});

	const verificarMatricula = async () => {
		if (matricula !== "") {
			setCarregando(true);

			try {
				const { data } = await api({
					url: "/associados/verificarMatricula",
					method: "GET",
					params: { cartao: matricula },
					headers: { "x-access-token": token },
				});

				if (data.status) {
					setAssociado(data);
					setMostrarDados(true);
				} else {
					setAssociado({});
					setMostrarDados(false);
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: data.message,
						type: "danger",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
					});
				}

				setCarregando(false);
				Keyboard.dismiss();
			} catch (error) {
				setAssociado({});
				setCarregando(false);
				setMostrarDados(false);
				Keyboard.dismiss();

				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Ocorreu um erro ao verificar a matrícula.",
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

	const gerarSenha = async () => {
		try {
			const { data } = await api.post("/associados/gerarSenhaAppDependente", {
				cartao: associado.cartao,
				celular: associado.celular,
			});

			if (data.status) {
				setMatricula("");
				setAssociado({});
				setMostrarDados(false);

				setAlerta({
					visible: true,
					title: data.title,
					message:
						"Uma nova senha será enviada para o celular do titular. Caso o titular não receba o SMS, entre em contato com a ABEPOM.",
					type: "success",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
				});
			} else {
				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					type: "danger",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
				});
			}
		} catch (error) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "Ocorreu um erro ao tentar gerar a senha.",
				type: "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
			});
		}
	};

	return (
		<>
			<Header titulo={"Gerar Senha"} {...props} />
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
						Gere uma senha para acesso ao aplicativo ABEPOM Mobile para a
						matrícula abaixo.
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
														<Text style={{ fontWeight: "bold" }}>
															{associado.nome}
														</Text>
														{associado.tipo === "01" ? (
															<Text style={{ color: tema.colors.verde }}>
																ASSOCIADO ABEPOM
															</Text>
														) : (
															<Text style={{ color: tema.colors.vermelho }}>
																NÃO ASSOCIADO
															</Text>
														)}
													</View>
													<View style={{ flex: 1 }}>
														<Text style={{ textAlign: "right" }}>
															Nascimento: {associado.nascimento}
														</Text>
														<Text style={{ textAlign: "right" }}>
															{associado.email}
														</Text>
													</View>
												</View>
												<View style={{ flexDirection: "row", flex: 1 }}>
													<View style={{ flex: 1 }} />
													<View style={{ flex: 2 }}>
														{associado.tipo === "01" ? (
															<>
																{associado.cartao !== "" &&
																	associado.ativo &&
																	associado.celular !== "" && (
																		<TouchableOpacity
																			onPress={() => gerarSenha()}
																			style={{
																				flexDirection: "row",
																				margin: 20,
																				backgroundColor: "#031e3f",
																				justifyContent: "center",
																				padding: 20,
																				borderRadius: 6,
																			}}
																		>
																			<Text
																				style={{
																					color: "#fff",
																					fontSize: 17,
																					marginRight: 10,
																				}}
																			>
																				GERAR SENHA PARA TITULAR
																			</Text>
																			<Image
																				source={images.chave}
																				style={{
																					width: 20,
																					height: 20,
																					tintColor: "#fff",
																				}}
																				tintColor={"#fff"}
																			/>
																		</TouchableOpacity>
																	)}
																{associado.cartao === "" && (
																	<View style={{ height: 100 }}>
																		<Messages
																			titulo={`SEM CARTÃO`}
																			subtitulo="O associado informado não possui o cartão da ABEPOM."
																			cor={tema.colors.vermelho}
																			imagem={images.atencao}
																		/>
																	</View>
																)}
																{!associado.ativo && (
																	<View style={{ height: 100 }}>
																		<Messages
																			titulo={`ASSOCIADO INATIVO`}
																			subtitulo="O associado informado consta como inativo."
																			cor={tema.colors.vermelho}
																			imagem={images.atencao}
																		/>
																	</View>
																)}
																{associado.celular === "" && (
																	<View style={{ height: 100 }}>
																		<Messages
																			titulo={`ASSOCIADO SEM CELULAR`}
																			subtitulo="O associado informado não possui o celular cadastrado na ABEPOM."
																			cor={tema.colors.vermelho}
																			imagem={images.atencao}
																		/>
																	</View>
																)}
															</>
														) : (
															<TouchableOpacity
																onPress={() =>
																	navigation.navigate("CadastrarAssociado")
																}
																style={{
																	flexDirection: "row",
																	margin: 20,
																	backgroundColor: "#031e3f",
																	justifyContent: "center",
																	padding: 20,
																	borderRadius: 6,
																}}
															>
																<Text
																	style={{
																		color: "#fff",
																		fontSize: 17,
																		marginRight: 10,
																	}}
																>
																	CADASTRAR ASSOCIADO
																</Text>
																<Image
																	source={images.seta}
																	style={{
																		width: 20,
																		height: 20,
																		tintColor: "#fff",
																	}}
																	tintColor={"#fff"}
																/>
															</TouchableOpacity>
														)}
													</View>
													<View style={{ flex: 1 }} />
												</View>
											</>
										) : (
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

export default GerarSenha;
