import React, { useEffect, useState } from "react";
import {
	Image,
	Keyboard,
	SafeAreaView,
	Text,
	TouchableOpacity,
	View,
	ScrollView,
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
import PickerModal from "react-native-picker-modal-view";
import formatDate from "../functions/formatDate";
import isDate from "../functions/isDate";
import calculateAge from "../functions/calculateAge";
import { useUsuario } from "../store/Usuario";

function PlanoDeSaude(props) {
	let d = new Date();
	const [{ token }] = useUsuario();
	const [matricula, setMatricula] = useState("");
	const [alerta, setAlerta] = useState({});
	const [carregando, setCarregando] = useState(false);
	const [associado, setAssociado] = useState({});
	const [dependentes, setDependentes] = useState([]);
	const [mostrarDados, setMostrarDados] = useState(false);
	const [dataMovimentacao] = useState(
		("0" + d.getDate()).slice(-2) +
			"/" +
			("0" + d.getMonth() + 1).slice(-2) +
			"/" +
			d.getFullYear()
	);
	const [beneficiario, setBeneficiario] = useState({
		Name: "",
		Value: "",
		data_nascimento: "",
		idade: 0,
		estado_civil: { Name: "", Value: "" },
		sexo: "",
		tipo: "",
		local_cobranca: { Name: "", Value: "" },
		cpf: "",
		valor_mensalidade: 0,
	});

	const listarPlanos = async () => {
		try {
			const { data } = await api({
				url: "/listarPlanosDeSaude",
				method: "GET",
				headers: { "x-access-token": token },
			});

			let plans = [];

			data.planos.map((plano) => {
				plans.push({
					Name: plano.plano + " | " + plano.nome_plano,
					Value: plano.plano,
					valor_mensalidade: plano.valor_mensalidade,
				});
			});

			setPlanos(plans);
		} catch (error) {
			setPlanos([]);
		}
	};

	const verificarMatricula = async () => {
		let dataFormat = "";
		let age = 0;

		if (matricula !== "") {
			setCarregando(true);
			setBeneficiario({
				Name: "",
				Value: "",
				data_nascimento: "",
				idade: 0,
				estado_civil: { Name: "", Value: "" },
				sexo: "",
				tipo: "",
				local_cobranca: { Name: "", Value: "" },
				cpf: "",
				valor_mensalidade: 0,
			});
			setAssociado({});
			setDependentes([]);
			setPlano({
				Name: "",
				Value: "",
				valor_faixas: [],
			});

			try {
				const retorno = await api({
					url: "/associados/verificarMatricula",
					method: "GET",
					params: { cartao: matricula },
					headers: { "x-access-token": token },
				});

				setAssociado(retorno.data);

				if (retorno.data.status) {
					const { data } = await api({
						url: "/associados/listarDependentes",
						method: "GET",
						params: {
							cartao: `${matricula}00001`,
						},
						headers: { "x-access-token": token },
					});

					let deps = [];

					dataFormat = formatDate(retorno.data.nascimento, "AMD");

					if (isDate(new Date(dataFormat))) {
						age = calculateAge(dataFormat);
					} else {
						age = 0;
					}

					deps.push({
						Name: retorno.data.nome,
						Value: retorno.data.cd_dependente,
						data_nascimento: retorno.data.nascimento,
						idade: age,
						estado_civil: { Name: "", Value: "" },
						sexo: retorno.data.sexo.Name,
						tipo: "TITULAR",
						local_cobranca: { Name: "", Value: "" },
						cpf: retorno.data.cpf,
						valor_mensalidade: 0,
						possui_plano: retorno.data.possui_plano == 1 ? true : false,
					});

					data.dependentes.map((dependente) => {
						dataFormat = formatDate(dependente.data_nascimento, "AMD");

						if (isDate(new Date(dataFormat))) {
							age = calculateAge(dataFormat);
						} else {
							age = 0;
						}

						deps.push({
							Name: dependente.nome,
							Value: dependente.cont,
							data_nascimento: dependente.data_nascimento,
							idade: age,
							estado_civil: { Name: "", Value: "" },
							sexo: dependente.sexo === "M" ? "MASCULINO" : "FEMININO",
							tipo: dependente.tipo.toUpperCase(),
							local_cobranca: { Name: "", Value: "" },
							cpf: dependente.cpf,
							valor_mensalidade: 0,
							possui_plano: dependente.possui_plano == 1 ? true : false,
						});
					});

					setDependentes(deps);
					setMostrarDados(true);
				} else {
					setDependentes([]);
					setMostrarDados(false);

					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: retorno.data.message,
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
				setDependentes([]);
				setCarregando(false);
				setMostrarDados(false);
				Keyboard.dismiss();

				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Ocorreu um erro ao tentar verificar a matrícula.",
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

	const selecionarPlano = (key, ben = beneficiario) => {
		let id = ben.idade;
		let index = 1;

		setPlano(key);

		switch (true) {
			case id >= 0 && id <= 18:
				//00 - 18
				index = 1;
				break;
			case id >= 19 && id <= 23:
				//19 - 23
				index = 2;
				break;
			case id >= 24 && id <= 28:
				//24 - 28
				index = 3;
				break;
			case id >= 29 && id <= 33:
				//29 - 33
				index = 4;
				break;
			case id >= 34 && id <= 38:
				//34 - 38
				index = 5;
				break;
			case id >= 39 && id <= 43:
				//39 - 43
				index = 6;
				break;
			case id >= 44 && id <= 48:
				//44 - 48
				index = 7;
				break;
			case id >= 49 && id <= 53:
				//49 - 53
				index = 8;
				break;
			case id >= 54 && id <= 58:
				//54 - 58
				index = 9;
				break;
			case id >= 59:
				//59+
				index = 10;
				break;
			default:
				index = 0;
				break;
		}

		let { valor } = key.valor_mensalidade.find((item) => item.faixa == index);

		setBeneficiario({
			...ben,
			valor_mensalidade: valor,
		});
	};

	const selecionarBeneficiario = (key) => {
		setBeneficiario(key);

		console.log(key);

		if (plano?.Name !== "") {
			selecionarPlano(plano, key);
		}
	};

	const incluirPlano = async () => {
		setAlerta({
			visible: true,
			title: "CADASTRANDO DADOS DO PLANO",
			message: <Loading size={120} />,
			showIcon: false,
			showCancel: false,
			showConfirm: false,
		});

		let erros = 0;
		let msg = "Para prosseguir é necessário: \n\n";

		if (plano?.Name === "" || beneficiario?.Name === "") {
			erros++;
			msg = "Selecionar o beneficiário e o plano.\n";
		}

		if (beneficiario?.local_cobranca?.Name == "") {
			erros++;
			msg += "Selecionar o local de cobrança.\n";
		}

		if (beneficiario?.estado_civil?.Name == "") {
			erros++;
			msg += "Selecionar o estado civil do beneficiário.\n";
		}

		if (erros > 0) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: msg,
				type: "danger",
				showCancel: false,
				showConfirm: true,
				confirmText: "FECHAR",
			});
		} else {
			try {
				const { data } = await api({
					url: "/associados/cadastrarPlanoDeSaude",
					method: "POST",
					data: {
						beneficiario: {
							...beneficiario,
							data_nascimento: formatDate(beneficiario.data_nascimento, "AMD"),
						},
						plano,
						associado,
					},
					headers: { "x-access-token": token },
				});

				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					type: data.status ? "success" : "danger",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});

				if (data.status) {
					setMatricula("");
					setBeneficiario({
						Name: "",
						Value: "",
						data_nascimento: "",
						idade: 0,
						estado_civil: { Name: "", Value: "" },
						sexo: "",
						tipo: "",
						local_cobranca: { Name: "", Value: "" },
						cpf: "",
						valor_mensalidade: 0,
					});
					setAssociado({});
					setDependentes([]);
					setPlano({
						Name: "",
						Value: "",
						valor_faixas: [],
					});
					setMostrarDados(false);
				}
			} catch (error) {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Ocorreu um erro ao tentar cadastrar o plano de saúde.",
					type: "danger",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});
			}
		}
	};

	useEffect(() => {
		listarPlanos();
	}, []);

	return (
		<>
			<Header titulo="Cadastro de Plano de Saúde" {...props} />
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
						Cadastre um plano de saúde para o titular da matrícula informada
						abaixo.
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
					<ScrollView style={{ flex: 1, marginTop: 50 }}>
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
												<View style={{ flexDirection: "row", marginBottom: 5 }}>
													<View style={{ flex: 4, marginRight: 5 }}>
														<TextInput
															label="Nome"
															mode={"outlined"}
															theme={tema}
															value={associado.nome}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 2 }}>
														<TextInput
															label="Data de Nascimento"
															mode={"outlined"}
															theme={tema}
															value={associado.nascimento}
															style={{ fontSize: 18 }}
															disabled
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
												</View>
												<View style={{ flexDirection: "row", marginBottom: 5 }}>
													<View style={{ flex: 3, marginRight: 5 }}>
														<TextInput
															label="Endereço"
															mode={"outlined"}
															theme={tema}
															value={associado.endereco}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 1, marginRight: 5 }}>
														<TextInput
															label="Número"
															mode={"outlined"}
															theme={tema}
															value={associado.numero}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 2 }}>
														<TextInput
															label="Complemento"
															mode={"outlined"}
															theme={tema}
															value={associado.complemento}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
												</View>
												<View style={{ flexDirection: "row", marginBottom: 5 }}>
													<View style={{ flex: 2, marginRight: 5 }}>
														<TextInput
															label="Cidade"
															mode={"outlined"}
															theme={tema}
															value={associado.cidade.Name + " / SC"}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 1, marginRight: 5 }}>
														<TextInput
															label="CEP"
															mode={"outlined"}
															theme={tema}
															value={associado.cep}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 2 }}>
														<TextInput
															label="Telefone Comercial"
															mode={"outlined"}
															theme={tema}
															value={associado.telefone_comercial}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
												</View>
												<View style={{ flexDirection: "row", marginBottom: 5 }}>
													<View style={{ flex: 1, marginRight: 5 }}>
														<TextInput
															label="Telefone Residencial"
															mode={"outlined"}
															theme={tema}
															value={associado.telefone_residencial}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 1, marginRight: 5 }}>
														<TextInput
															label="Celular"
															mode={"outlined"}
															theme={tema}
															value={associado.celular}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 3 }}>
														<TextInput
															label="E-mail"
															mode={"outlined"}
															theme={tema}
															value={associado.email}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
												</View>
												<View
													style={{
														flexDirection: "row",
														justifyContent: "flex-end",
													}}
												>
													<Text
														style={{
															fontSize: 18,
															color: tema.colors.vermelho,
														}}
													>
														Ultima atualização em {associado.data_recadastro}
													</Text>
												</View>
												<View
													style={{
														flexDirection: "row",
														marginBottom: 5,
														marginTop: 20,
													}}
												>
													<View style={{ flex: 2, marginRight: 5 }}>
														<TextInput
															label="Beneficiário"
															mode={"outlined"}
															theme={tema}
															style={{ fontSize: 18 }}
															value={beneficiario}
															onChangeText={(text) => setBeneficiario(text)}
															render={() => (
																<PickerModal
																	renderSelectView={(
																		disabled,
																		selected,
																		showModal
																	) => (
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
																					style={{
																						fontSize: beneficiario ? 15 : 12,
																					}}
																				>
																					{beneficiario.Name === ""
																						? "SELECIONE"
																						: beneficiario.Name}
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
																	selected={beneficiario}
																	selectPlaceholderText="SELECIONE O BENEFICIÁRIO"
																	searchPlaceholderText="DIGITE O BENEFICIÁRIO"
																	onSelected={(key) =>
																		selecionarBeneficiario(key)
																	}
																	onClosed={() => setBeneficiario(beneficiario)}
																	items={dependentes}
																/>
															)}
														/>
													</View>
													<View style={{ flex: 2 }}>
														<TextInput
															label="Plano"
															mode={"outlined"}
															theme={tema}
															style={{ fontSize: 18 }}
															value={plano}
															onChangeText={(text) => setPlano(text)}
															render={() => (
																<PickerModal
																	renderSelectView={(
																		disabled,
																		selected,
																		showModal
																	) => (
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
																					style={{
																						fontSize: plano ? 15 : 12,
																					}}
																				>
																					{plano.Name === ""
																						? "SELECIONE"
																						: plano.Name}
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
																	selected={plano}
																	selectPlaceholderText="SELECIONE O PLANO"
																	searchPlaceholderText="DIGITE O PLANO"
																	onSelected={(key) => selecionarPlano(key)}
																	onClosed={() => setPlano(plano)}
																	items={planos}
																/>
															)}
														/>
													</View>
												</View>
												<View style={{ flexDirection: "row", marginBottom: 5 }}>
													<View style={{ flex: 1, marginRight: 5 }}>
														<TextInput
															label="Data de Nascimento"
															mode={"outlined"}
															theme={tema}
															value={beneficiario.data_nascimento}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 1, marginRight: 5 }}>
														<TextInput
															label="Idade"
															mode={"outlined"}
															theme={tema}
															value={beneficiario.idade.toString()}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 1 }}>
														<TextInput
															label="Estado Civil"
															mode={"outlined"}
															theme={tema}
															value={beneficiario.estado_civil}
															style={{ fontSize: 18 }}
															onChangeText={(text) =>
																setBeneficiario({
																	...beneficiario,
																	estado_civil: text,
																})
															}
															render={() => (
																<PickerModal
																	renderSelectView={(
																		disabled,
																		selected,
																		showModal
																	) => (
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
																					style={{
																						fontSize: beneficiario ? 15 : 12,
																					}}
																				>
																					{beneficiario.estado_civil.Name === ""
																						? "SELECIONE"
																						: beneficiario.estado_civil.Name}
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
																	selected={beneficiario.estado_civil}
																	selectPlaceholderText="SELECIONE O ESTADO CIVIL"
																	searchPlaceholderText="DIGITE O ESTADO CIVIL"
																	onSelected={(key) =>
																		setBeneficiario({
																			...beneficiario,
																			estado_civil: key,
																		})
																	}
																	onClosed={() => setBeneficiario(beneficiario)}
																	items={[
																		{
																			Name: "Solteiro(a)",
																			Value: "Solteiro(a)",
																		},
																		{ Name: "Casado(a)", Value: "Casado(a)" },
																		{
																			Name: "Desquitado(a)",
																			Value: "Desquitado(a)",
																		},
																		{ Name: "Viúvo(a)", Value: "Viúvo(a)" },
																		{
																			Name: "Divorciado(a)",
																			Value: "Divorciado(a)",
																		},
																		{
																			Name: "Separado(a) Judicialmente",
																			Value: "Separado(a) Judicialmente",
																		},
																		{
																			Name: "Amasiado(a)",
																			Value: "Amasiado(a)",
																		},
																		{ Name: "Outro", Value: "Outro" },
																	]}
																/>
															)}
														/>
													</View>
												</View>
												<View style={{ flexDirection: "row", marginBottom: 5 }}>
													<View style={{ flex: 1, marginRight: 5 }}>
														<TextInput
															label="Sexo"
															mode={"outlined"}
															theme={tema}
															value={beneficiario.sexo}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 1, marginRight: 5 }}>
														<TextInput
															label="Tipo de Dependente"
															mode={"outlined"}
															theme={tema}
															value={beneficiario.tipo}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
													<View style={{ flex: 1, marginRight: 5 }}>
														<TextInput
															label="CPF"
															mode={"outlined"}
															theme={tema}
															value={beneficiario.cpf}
															style={{ fontSize: 18 }}
															disabled={beneficiario?.cpf === "" ? false : true}
															maxLength={14}
															keyboardType={"number-pad"}
															onChangeText={(text) =>
																setBeneficiario({ ...beneficiario, cpf: text })
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
													<View style={{ flex: 1 }}>
														<TextInput
															label="Local de Cobrança"
															mode={"outlined"}
															theme={tema}
															value={beneficiario.local_cobranca}
															style={{ fontSize: 18 }}
															onChangeText={(text) =>
																setBeneficiario({
																	...beneficiario,
																	local_cobranca: text,
																})
															}
															render={() => (
																<PickerModal
																	renderSelectView={(
																		disabled,
																		selected,
																		showModal
																	) => (
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
																					style={{
																						fontSize: beneficiario ? 15 : 12,
																					}}
																				>
																					{beneficiario.local_cobranca.Name ===
																					""
																						? "SELECIONE"
																						: beneficiario.local_cobranca.Name}
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
																	selected={beneficiario.local_cobranca}
																	selectPlaceholderText="SELECIONE O LOCAL DE COBRANÇA"
																	searchPlaceholderText="DIGITE O LOCAL DE COBRANÇA"
																	onSelected={(key) =>
																		setBeneficiario({
																			...beneficiario,
																			local_cobranca: key,
																		})
																	}
																	onClosed={() => setBeneficiario(beneficiario)}
																	items={[
																		{ Name: "Folha", Value: "1-Folha" },
																		{ Name: "Boleto", Value: "2-Boleto" },
																		{
																			Name: "Conta Corrente",
																			Value: "3-Conta Corrente",
																		},
																	]}
																/>
															)}
														/>
													</View>
												</View>
												<View
													style={{
														flexDirection: "row",
														justifyContent: "flex-start",
														marginBottom: 5,
													}}
												>
													<View style={{ flex: 2, marginRight: 5 }}>
														<TextInput
															label="Valor Mensal do Plano"
															mode={"outlined"}
															theme={tema}
															style={{
																fontSize: 20,
																fontWeight: "bold",
																color: tema.colors.primary,
															}}
															value={beneficiario.valor_mensalidade.toString()}
															disabled
															render={(props) => (
																<TextInputMask
																	{...props}
																	type={"money"}
																	options={{
																		precision: 2,
																		separator: ",",
																		delimiter: ".",
																		unit: "R$ ",
																		suffixUnit: "",
																	}}
																/>
															)}
														/>
													</View>
													<View style={{ flex: 2 }}>
														<TextInput
															label="Data de Movimentação"
															mode={"outlined"}
															theme={tema}
															value={dataMovimentacao}
															style={{ fontSize: 18 }}
															disabled
														/>
													</View>
												</View>
												{beneficiario?.Name !== "" && plano?.Name !== "" && (
													<View
														style={{
															flexDirection: "row",
															justifyContent: "center",
															alignItems: "center",
															marginTop: 30,
														}}
													>
														<TouchableOpacity
															onPress={() => {
																if (beneficiario.possui_plano) {
																	setAlerta({
																		visible: true,
																		title: "ATENÇÃO!",
																		message:
																			"O beneficiário escolhido já possui um plano de saúde ativo. Deseja cancelar e cadastrar este novo?",
																		type: "warning",
																		confirmText: "SIM",
																		cancelText: "FECHAR",
																		showConfirm: true,
																		showCancel: true,
																		confirmFunction: () => incluirPlano(),
																	});
																} else {
																	incluirPlano();
																}
															}}
															style={{
																backgroundColor: tema.colors.primary,
																padding: 20,
																borderRadius: 6,
															}}
														>
															<Text style={{ color: "#fff", fontSize: 18 }}>
																INCLUIR PLANO DE SAÚDE
															</Text>
														</TouchableOpacity>
													</View>
												)}
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
					</ScrollView>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default PlanoDeSaude;
