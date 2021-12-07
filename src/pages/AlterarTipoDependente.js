import React, { useEffect, useState } from "react";
import {
	AsyncStorage,
	Image,
	SafeAreaView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import { TextInput } from "react-native-paper";
import PickerModal from "react-native-picker-modal-view";
import { tema } from "../../assets/style/Style";
import api from "../../services/api";
import Alert from "../components/Alert";
import Header from "../components/Header";
import images from "../utils/images";
import * as ImagePicker from "expo-image-picker";
import * as Camera from "expo-camera";
import Loading from "../components/Loading";
import { useUsuario } from "../store/Usuario";

function AlterarTipoDependente(props) {
	const { navigation } = props;
	const data_atual = new Date();
	const [{ token }] = useUsuario();
	const [matricula, setMatricula] = useState(props.route.params.matricula);
	const [dependente, setDependente] = useState({
		...props.route.params.dependente,
		novo_tipo: { Name: "", Value: "" },
		telefone: "",
	});
	const [tipos, setTipos] = useState([]);
	const [mostrarTaxa, setMostrarTaxa] = useState(false);
	const [solicitarAtestado, setSolicitarAtestado] = useState(false);
	const [alerta, setAlerta] = useState({});
	const [atestado, setAtestado] = useState("");

	const listarTipos = async () => {
		let ano_aniversario = parseInt(dependente.data_nascimento.substring(6, 10));

		switch (dependente.cod_dep) {
			case "01":
				if (!isNaN(ano_aniversario)) {
					if (parseInt(data_atual.getFullYear()) - ano_aniversario >= 18) {
						setTipos([
							{ Name: "FILHOS MAIORES", Value: "31" },
							parseInt(data_atual.getFullYear()) - ano_aniversario < 24 && {
								Name: "UNIVERSITÁRIO(A)",
								Value: "20",
							},
						]);
					} else {
						setTipos([
							{
								Name: dependente.tipo.toUpperCase(),
								Value: dependente.cod_dep,
							},
						]);
					}
				} else {
					setTipos([
						{
							Name: dependente.tipo.toUpperCase(),
							Value: dependente.cod_dep,
						},
					]);
				}

				break;

			case "09":
				if (!isNaN(ano_aniversario)) {
					if (parseInt(data_atual.getFullYear()) - ano_aniversario >= 18) {
						setTipos([
							{ Name: "ENDEADO(A) MAIOR", Value: "15" },
							parseInt(data_atual.getFullYear()) - ano_aniversario < 24 && {
								Name: "UNIVERSITÁRIO(A)",
								Value: "20",
							},
						]);
					} else {
						setTipos([
							{
								Name: dependente.tipo.toUpperCase(),
								Value: dependente.cod_dep,
							},
						]);
					}
				} else {
					setTipos([
						{
							Name: dependente.tipo.toUpperCase(),
							Value: dependente.cod_dep,
						},
					]);
				}
				break;
			case "20":
				if (!isNaN(ano_aniversario)) {
					if (parseInt(data_atual.getFullYear()) - ano_aniversario >= 24) {
						setTipos([{ Name: "FILHOS MAIORES", Value: "31" }]);
					} else {
						setTipos([
							{
								Name: dependente.tipo.toUpperCase(),
								Value: dependente.cod_dep,
							},
						]);
					}
				} else {
					setTipos([
						{
							Name: dependente.tipo.toUpperCase(),
							Value: dependente.cod_dep,
						},
					]);
				}
				break;
			case "23":
			case "99":
				try {
					const { data } = await api.get("/listarTiposDependente");

					let list_tipos = [];

					data.tipos.map((tipo) => {
						if (tipo.cobra_mensalidade) {
							list_tipos.push({ Name: tipo.descricao, Value: tipo.codigo });
						}
					});

					setTipos(list_tipos);
				} catch (error) {
					setTipos([]);
				}

				break;
			default:
				setTipos([
					{
						Name: dependente.tipo.toUpperCase(),
						Value: dependente.cod_dep,
					},
				]);
				break;
		}
	};

	function alterarTipo(codigo) {
		switch (codigo) {
			case "07":
			case "11":
			case "12":
			case "13":
			case "14":
			case "15":
			case "16":
			case "17":
			case "21":
			case "31":
			case "34":
				setMostrarTaxa(true);
				setSolicitarAtestado(false);
				break;
			case "20":
				setMostrarTaxa(false);
				setSolicitarAtestado(true);
				break;
			default:
				setMostrarTaxa(false);
				setSolicitarAtestado(false);
				break;
		}
	}

	const salvarAlteracoes = async () => {
		if (solicitarAtestado && atestado === "") {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message:
					"Para prosseguir é necessário enviar o atestado de frequência.",
				type: "danger",
				showCancel: false,
				showConfirm: true,
				confirmText: "FECHAR",
			});
			return;
		} else {
			let data_valida = new Date(
				dependente.data_nascimento.substring(6, 10) +
					"-" +
					dependente.data_nascimento.substring(3, 5) +
					"-" +
					dependente.data_nascimento.substring(0, 2)
			);

			if (isNaN(data_valida.getTime()) || data_valida.getFullYear() <= 1910) {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "A data de nascimento informada está incorreta.",
					type: "danger",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});
				return;
			}

			if (dependente?.novo_tipo?.Name === "") {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message:
						"Para prosseguir com a alteração dos dados é necessário selecionar o tipo de dependente.",
					type: "danger",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});
				return;
			}

			setAlerta({
				visible: true,
				title: "SALVANDO INFORMAÇÕES",
				message: <Loading size={120} />,
				showIcon: false,
				showCancel: false,
				showConfirm: false,
			});

			const { data, status } = await api({
				url: "/associados/alterarTipoDependente",
				method: "POST",
				data: { dependente, matricula },
				headers: { "x-access-token": token },
			});

			if (status == 401) {
				setAlerta({
					visible: true,
					title: "SESSÃO EXPIRADA!",
					message: `A sua sessão expirou. Você será deslogado em 5 segundos.`,
					type: "warning",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});

				setTimeout(async () => {
					await AsyncStorage.clear().then(() =>
						navigation.navigate("Login", { id: new Date().toJSON() })
					);
				}, 5000);
			} else {
				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					type: data.status ? "success" : "danger",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});
			}
		}
	};

	const enviarAtestado = async () => {
		let permissao_atual = await Camera.getCameraPermissionsAsync();

		if (permissao_atual.status != "granted") {
			let permissao = await Camera.requestCameraPermissionsAsync();

			if (permissao.status != "granted") {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Você não forneceu permissão para acessar a câmera.",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
					type: "danger",
				});
				return;
			}
		}

		let result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: false,
			aspect: [4, 3],
			quality: 0.5,
		});

		if (!result.cancelled) {
			try {
				const { uri } = result;

				let extensao = uri.split(".")[uri.split(".").length - 1];

				const formulario = new FormData();
				formulario.append("matricula", `${matricula}`);
				formulario.append("dependente", `${dependente.cont}`);
				formulario.append("tipo", "AF");
				formulario.append("file", {
					uri,
					type: `image/${extensao}`,
					name: `${matricula}_${new Date().toJSON()}.${extensao}`,
				});

				const { data } = await api.post("/enviarDocumentoTitular", formulario, {
					headers: {
						"Content-Type": `multipart/form-data; boundary=${formulario._boundary}`,
						"x-access-token": token,
					},
				});

				if (data.status) {
					setAtestado(data.link);
				}
			} catch (error) {
				setAtestado("");
			}
		}
	};

	useEffect(() => {
		listarTipos();
	}, []);

	return (
		<>
			<Header titulo="Alterar Tipo de Dependente" {...props} />
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
						Altere o tipo de dependência do dependente abaixo.
					</Text>
					<View style={{ flexDirection: "row", marginBottom: 15 }}>
						<View style={{ flex: 1 }}>
							<TextInput
								label="Nome"
								mode={"outlined"}
								theme={tema}
								value={dependente.nome}
								maxLength={40}
								style={{ fontSize: 18 }}
								returnKeyType={"next"}
								disabled
							/>
						</View>
					</View>
					<View style={{ flexDirection: "row", marginBottom: 15 }}>
						<View style={{ flex: 1, marginRight: 5 }}>
							<TextInput
								label="Sexo"
								mode={"outlined"}
								theme={tema}
								style={{ fontSize: 18 }}
								value={dependente.sexo}
								onChangeText={(text) =>
									setDependente({ ...dependente, sexo: text })
								}
								render={() => (
									<PickerModal
										renderSelectView={(disabled, selected, showModal) => (
											<TouchableOpacity
												style={{
													flexDirection: "row",
													flex: 1,
													justifyContent: "flex-start",
													alignItems: "center",
													paddingLeft: 10,
												}}
												disabled={disabled}
												onPress={showModal}
											>
												<View style={{ flex: 3 }}>
													<Text style={{ fontSize: dependente.sexo ? 15 : 12 }}>
														{dependente.sexo
															? dependente.sexo === "F"
																? "FEMININO"
																: "MASCULINO"
															: "SELECIONE"}
													</Text>
												</View>
												<View
													style={{
														flex: 1,
														alignItems: "flex-end",
														paddingRight: 10,
													}}
												>
													<Image
														source={images.seta}
														tintColor={"#031e3f"}
														style={{
															width: 10,
															height: 10,
															right: 0,
															tintColor: "#031e3f",
															transform: [{ rotate: "90deg" }],
														}}
													/>
												</View>
											</TouchableOpacity>
										)}
										modalAnimationType="fade"
										selected={
											dependente.sexo == "M"
												? { Name: "MASCULINO", Value: "M" }
												: { Name: "FEMININO", Value: "F" }
										}
										selectPlaceholderText="SELECIONE O SEXO"
										searchPlaceholderText="DIGITE O SEXO"
										onSelected={(key) =>
											setDependente({ ...dependente, sexo: key.Value })
										}
										onClosed={() =>
											setDependente({ ...dependente, sexo: dependente.sexo })
										}
										items={[
											{ Name: "MASCULINO", Value: "M" },
											{ Name: "FEMININO", Value: "F" },
										]}
									/>
								)}
							/>
						</View>
						<View style={{ flex: 1 }}>
							<TextInput
								label="Data de Nascimento"
								mode={"outlined"}
								theme={tema}
								value={dependente.data_nascimento}
								keyboardType={"numeric"}
								style={{ fontSize: 18 }}
								maxLength={10}
								render={(props) => (
									<TextInputMask
										{...props}
										type={"custom"}
										options={{
											mask: "99/99/9999",
										}}
									/>
								)}
							/>
						</View>
						<View style={{ flex: 2 }}>
							<TextInput
								label="Tipo de Dependência"
								mode={"outlined"}
								theme={tema}
								style={{ fontSize: 18 }}
								value={dependente.novo_tipo}
								onChangeText={(text) =>
									setDependente({ ...dependente, novo_tipo: text })
								}
								render={() => (
									<PickerModal
										renderSelectView={(disabled, selected, showModal) => (
											<TouchableOpacity
												style={{
													flexDirection: "row",
													flex: 1,
													justifyContent: "flex-start",
													alignItems: "center",
													paddingLeft: 10,
												}}
												disabled={disabled}
												onPress={showModal}
											>
												<View style={{ flex: 3 }}>
													<Text
														style={{ fontSize: dependente.novo_tipo ? 15 : 12 }}
													>
														{dependente.novo_tipo?.Name !== ""
															? dependente.novo_tipo.Name
															: "SELECIONE"}
													</Text>
												</View>
												<View
													style={{
														flex: 1,
														alignItems: "flex-end",
														paddingRight: 10,
													}}
												>
													<Image
														source={images.seta}
														tintColor={"#031e3f"}
														style={{
															width: 10,
															height: 10,
															right: 0,
															tintColor: "#031e3f",
															transform: [{ rotate: "90deg" }],
														}}
													/>
												</View>
											</TouchableOpacity>
										)}
										modalAnimationType="fade"
										selected={dependente.novo_tipo}
										selectPlaceholderText="SELECIONE O TIPO"
										searchPlaceholderText="DIGITE O TIPO"
										onSelected={(key) => {
											alterarTipo(key.Value);
											setDependente({ ...dependente, novo_tipo: key });
										}}
										onClosed={() =>
											setDependente({
												...dependente,
												novo_tipo: dependente.novo_tipo,
											})
										}
										items={tipos}
									/>
								)}
							/>
						</View>
					</View>
					<View style={{ flexDirection: "row", marginBottom: 15 }}>
						<View style={{ flex: 1, marginRight: 5 }}>
							<TextInput
								label="CPF"
								mode={"outlined"}
								theme={tema}
								value={dependente.cpf}
								maxLength={14}
								style={{ fontSize: 18 }}
								keyboardType={"number-pad"}
								onChangeText={(text) =>
									setDependente({ ...dependente, cpf: text })
								}
								render={(props) => (
									<TextInputMask
										{...props}
										type={"custom"}
										options={{
											mask: "999.999.999-99",
										}}
									/>
								)}
							/>
						</View>
						<View style={{ flex: 1, marginRight: 5 }}>
							<TextInput
								label="Instagram"
								mode={"outlined"}
								theme={tema}
								value={dependente.instagram}
								maxLength={14}
								style={{ fontSize: 18 }}
								onChangeText={(text) =>
									setDependente({ ...dependente, instagram: text })
								}
							/>
						</View>
						<View style={{ flex: 1, marginRight: 5 }}>
							<TextInput
								label="Facebook"
								mode={"outlined"}
								theme={tema}
								value={dependente.facebook}
								maxLength={14}
								style={{ fontSize: 18 }}
								onChangeText={(text) =>
									setDependente({ ...dependente, facebook: text })
								}
							/>
						</View>
					</View>
					<View style={{ flexDirection: "row", marginBottom: 15 }}>
						<View style={{ flex: 1, marginRight: 5 }}>
							<TextInput
								label="Telefone"
								mode={"outlined"}
								theme={tema}
								value={dependente.telefone}
								maxLength={14}
								style={{ fontSize: 18 }}
								keyboardType={"number-pad"}
								onChangeText={(text) =>
									setDependente({ ...dependente, telefone: text })
								}
								render={(props) => (
									<TextInputMask
										{...props}
										type={"custom"}
										options={{
											mask: "(99) 9999-9999",
										}}
									/>
								)}
							/>
						</View>
						<View style={{ flex: 1, marginRight: 5 }}>
							<TextInput
								label="Celular"
								mode={"outlined"}
								theme={tema}
								value={dependente.celular}
								maxLength={16}
								style={{ fontSize: 18 }}
								keyboardType={"number-pad"}
								onChangeText={(text) =>
									setDependente({ ...dependente, celular: text })
								}
								render={(props) => (
									<TextInputMask
										{...props}
										type={"custom"}
										options={{
											mask: "(99) 9 9999-9999",
										}}
									/>
								)}
							/>
						</View>
						<View style={{ flex: 1, marginRight: 5 }}>
							<TextInput
								label="E-mail"
								mode={"outlined"}
								theme={tema}
								value={dependente.email}
								style={{ fontSize: 18 }}
								onChangeText={(text) =>
									setDependente({ ...dependente, email: text })
								}
							/>
						</View>
					</View>
					{dependente.cod_dep !== "23" && mostrarTaxa && (
						<View
							style={{
								flexDirection: "row",
								justifyContent: "center",
								alignItems: "center",
								marginVertical: 20,
							}}
						>
							<Text style={{ fontSize: 18, textTransform: "uppercase" }}>
								Lembre o associado sobre o pagamento da taxa suplementar de
								dependente.
							</Text>
						</View>
					)}
					{solicitarAtestado && (
						<View
							style={{
								justifyContent: "center",
								alignItems: "center",
								marginVertical: 25,
							}}
						>
							<TouchableOpacity
								onPress={() => enviarAtestado()}
								style={{
									backgroundColor: tema.colors.primary,
									padding: 20,
									borderRadius: 6,
								}}
							>
								<Text style={{ color: "#fff", fontSize: 18 }}>
									ENVIAR ATESTADO DE FREQUÊNCIA
								</Text>
							</TouchableOpacity>
							{atestado !== "" && (
								<Image
									source={{ uri: atestado }}
									style={{ width: 250, height: 250, marginVertical: 20 }}
								/>
							)}
						</View>
					)}
					<View style={{ justifyContent: "center", alignItems: "center" }}>
						<TouchableOpacity
							onPress={() =>
								dependente?.novo_tipo?.Name !== "" ? salvarAlteracoes() : null
							}
							style={{
								backgroundColor:
									dependente?.novo_tipo?.Name === ""
										? tema.colors.backdrop
										: tema.colors.primary,
								padding: 20,
								borderRadius: 6,
							}}
						>
							<Text style={{ color: "#fff", fontSize: 20 }}>
								SALVAR ALTERAÇÕES
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default AlterarTipoDependente;
