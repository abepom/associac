import React, { useState } from "react";
import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	Image,
	Keyboard,
	FlatList,
	Modal,
	Platform,
} from "react-native";
import images from "../utils/images";
import app from "../../app.json";
import s, { tema } from "../../assets/style/Style";
import { useUsuario } from "../store/Usuario";
import { Checkbox, IconButton, TextInput } from "react-native-paper";
import { TextInputMask } from "react-native-masked-text";
import Header from "../components/Header";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import ModalLoading from "../components/ModalLoading";
import Input from "../components/Input";
import WebView from "react-native-webview";
import MenuInicio from "../components/MenuInicio";
import Dependente from "../components/Dependente";
import compararValores from "../functions/compararValores";

function Inicio(props) {
	const { navigation } = props;
	const [usuario, setUsuario] = useUsuario();
	const [matricula, setMatricula] = useState("000006");
	const [alerta, setAlerta] = useState({ visible: false });
	const [carregando, setCarregando] = useState(false);
	const [dependenteEscolhido, setDependenteEscolhido] = useState({});
	const [motivoExclusao, setMotivoExclusao] = useState("");
	const [modalCarregando, setModalCarregando] = useState(false);
	const [modalTermoExclusao, setModalTermoEsclusao] = useState(false);
	const [modalExcluirDependente, setModalExcluirDependente] = useState(false);
	const [aceitoTermoExclusaoDependente, setAceitoTermoExclusaoDependente] =
		useState(false);
	const [termo, setTermo] = useState({});

	async function iniciarAtendimento() {
		Keyboard.dismiss();

		if (matricula !== "" && matricula.length == 6) {
			setCarregando(true);

			try {
				const { data } = await api({
					url: "/associados/verificarMatricula",
					method: "GET",
					params: { cartao: matricula },
					headers: { "x-access-token": usuario.token },
				});

				listarDependentes(data);
			} catch (error) {
				setUsuario({ ...usuario, associado_atendimento: null });
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

			setCarregando(false);
		} else {
			setUsuario({ ...usuario, associado_atendimento: null });
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message:
					"Para prosseguir com o atendimento é necessário informar a matrícula corretamente.",
				type: "danger",
				showConfirm: true,
				showCancel: false,
				confirmText: "FECHAR",
			});
		}
	}

	async function listarDependentes(dados) {
		const { data } = await api({
			url: "/associados/listarDependentes",
			method: "GET",
			params: {
				cartao: `${matricula}00001`,
			},
			headers: { "x-access-token": usuario.token },
		});

		setUsuario({
			...usuario,
			associado_atendimento: { ...dados, dependentes: data.dependentes },
		});
	}

	async function visualizarTermoExclusaoDependente() {
		setModalExcluirDependente(false);
		setModalTermoEsclusao(true);

		const { data } = await api({
			url: "/associados/visualizarTermo",
			method: "GET",
			params: { id_local: 8 },
			headers: { "x-access-token": usuario.token },
		});

		let t = data.termo;
		t = t
			.replace("@TITULAR", usuario.associado_atendimento.nome)
			.replace(
				"@DEPENDENTE",
				dependenteEscolhido.nome !== ""
					? `<b>${dependenteEscolhido.nome.toUpperCase()}</b>`
					: ""
			);

		if (Platform.OS === "ios") {
			t = t
				.replace(/font-size: 12pt !important;/g, `font-size: 30pt !important;`)
				.replace(
					/h3 style="text-align: center;"><span style="font-family: Arial, Helvetica, sans-serif;"/g,
					`h3 style="text-align: center;font-size: 40pt"><span style="font-family: Arial, Helvetica, sans-serif;"`
				);
		}

		setTermo({
			id: data.id_termo,
			texto: t,
		});
	}

	const excluirDependente = async () => {
		if (
			dependenteEscolhido.nome !== "" &&
			motivoExclusao !== "" &&
			aceitoTermoExclusaoDependente
		) {
			setModalExcluirDependente(false);
			setModalCarregando(true);

			const { data } = await api({
				url: "/associados/excluirDependente",
				method: "POST",
				data: {
					cartao: usuario.associado_atendimento.cartao,
					dep: dependenteEscolhido.cont,
					cd_dep: dependenteEscolhido.cod_dep,
					nome: dependenteEscolhido.nome,
					tipo: dependenteEscolhido.pre_cadastro ? 2 : 1,
					motivo: motivoExclusao,
					origem: "Associac Mobile",
				},
				headers: { "x-access-token": usuario.token },
			});

			let dependentes = usuario.associado_atendimento.dependentes.filter(
				(dep) => dep.cont !== dependenteEscolhido.cont
			);

			dependentes = dependentes
				.sort(compararValores("nome", "asc"))
				.sort(compararValores("pre_cadastro", "desc"));

			setUsuario({
				...usuario,
				associado_atendimento: {
					...usuario.associado_atendimento,
					dependentes,
				},
			});

			setModalCarregando(false);
			setAlerta({
				visible: true,
				title: data.title,
				message: data.message.replace(/@@/g, `\n`),
				type: data.status ? "success" : "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
			});

			setDependenteEscolhido({});
			setMotivoExclusao("");
			setAceitoTermoExclusaoDependente(false);
		} else {
			setModalExcluirDependente(false);
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message:
					"Para prosseguir é necessário selecionar o dependente, preencher o motivo e aceitar o Termo de Exclusão de Dependentes.",
				type: "danger",
				confirmText: "OK, PREENCHER!",
				cancelText: "FECHAR",
				showConfirm: true,
				showCancel: true,
				confirmFunction: () => {
					setAlerta({ visible: false });
					setModalExcluirDependente(true);
				},
			});
		}
	};

	return (
		<>
			<Header titulo={"Associac Mobile"} {...props} />
			<ModalLoading visible={modalCarregando} />
			<Modal visible={modalExcluirDependente} transparent>
				<View style={[s.fl1, s.jcc, s.aic, s.bgcm]}>
					<View
						style={[
							s.jcc,
							s.aic,
							s.pd20,
							s.m20,
							s.br6,
							s.bgcw,
							{
								width: "85%",
							},
						]}
					>
						<Text style={[s.tac, s.mb10, s.fs20]}>
							Você realmente deseja excluir o dependente{`\n`}
							<Text style={s.bold}>{dependenteEscolhido.nome}</Text>?
						</Text>
						<View style={[s.row, s.mt10]}>
							<Input
								label={"MOTIVO"}
								value={[motivoExclusao, setMotivoExclusao]}
								maxLength={300}
								returnKeyType={"done"}
								style={s.fullw}
							/>
						</View>
						<View style={[s.row, s.mt10, s.h35, s.jcc, s.aic]}>
							<TouchableOpacity
								onPress={() => visualizarTermoExclusaoDependente()}
								style={[s.row, s.jcc, s.aic, s.h35, s.fullw]}
							>
								<Image
									source={images.recadastrar_associado}
									style={[s.w35, s.h35, s.tcp]}
									tintColor={tema.colors.primary}
								/>
								<Text style={[s.fs18, s.bold, s.ml10, s.fcp]}>
									CLIQUE AQUI E LEIA O TERMO DE EXCLUSÃO
								</Text>
							</TouchableOpacity>
						</View>
						<View style={[s.row, s.mt10]}>
							<Checkbox
								status={aceitoTermoExclusaoDependente ? "checked" : "unchecked"}
								theme={tema}
								onPress={() => {
									Keyboard.dismiss();
									setAceitoTermoExclusaoDependente(
										!aceitoTermoExclusaoDependente
									);
								}}
							/>
							<TouchableOpacity
								onPress={() => {
									Keyboard.dismiss();
									setAceitoTermoExclusaoDependente(
										!aceitoTermoExclusaoDependente
									);
								}}
							>
								<Text style={[s.fs18, s.mt5]}>
									Eu declaro que li e aceito o Termo de Exclusão de Dependentes
								</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							onPress={() => excluirDependente()}
							style={[s.row, s.mt20, s.bgcp, s.br6, s.jcc, s.aic, s.pd20]}
						>
							<Image
								source={images.trash}
								style={[s.w20, s.h20, s.tcw]}
								tintColor={tema.colors.background}
							/>
							<Text style={[s.fcw, s.fs20, s.ml10]}>EXCLUIR DEPENDENTE</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity
						onPress={() => setModalExcluirDependente(false)}
						style={[s.row, s.bgcp, s.br50, s.pd15]}
					>
						<Image
							source={images.fechar}
							style={[s.w20, s.h20, s.tcw]}
							tintColor={tema.colors.background}
						/>
					</TouchableOpacity>
				</View>
			</Modal>
			<Modal animationType="fade" visible={modalTermoExclusao}>
				<View style={[s.row, s.fl1, s.jcc, s.aic, s.bgcm]}>
					<View style={[s.fl1, s.br6, s.m20]}>
						<View style={[s.fl1, s.br6, s.bgcw]}>
							<>
								<WebView
									source={{ html: termo.texto }}
									style={[s.jcc, s.aic, s.fl1, s.mv6]}
									textZoom={240}
									containerStyle={s.fs25}
									startInLoadingState={true}
									renderLoading={() => (
										<View style={[s.fl1, s.jcc, s.aic]}>
											<Loading size={80} />
										</View>
									)}
								/>
							</>
						</View>
						<View style={[s.jcc, s.aic, s.m10]}>
							<TouchableOpacity
								onPress={() => {
									setModalTermoEsclusao(false);
									setModalExcluirDependente(true);
								}}
								style={[s.row, s.bgcp, s.br50, s.pd15, s.w50, s.h50]}
							>
								<Image
									source={images.fechar}
									style={[s.w20, s.h20, s.tcw]}
									tintColor={tema.colors.background}
								/>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
			<SafeAreaView style={s.fl1}>
				<View style={[s.jcc, s.aic, s.mt20]}>
					<View style={s.row}>
						<View style={s.fl1} />
						<View style={s.fl2}>
							<TextInput
								label="Matrícula"
								mode={"outlined"}
								value={matricula}
								keyboardType={"numeric"}
								maxLength={6}
								theme={tema}
								style={s.fs25}
								placeholder={"Digite a matrícula"}
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
						<View style={s.fl1} />
					</View>
					<View style={[s.row, s.mt10]}>
						<View style={s.fl1} />
						<View style={s.fl2}>
							<TouchableOpacity
								onPress={() => iniciarAtendimento()}
								style={[s.row, s.aic, s.jcc, s.bgcp, s.br6, s.h50]}
							>
								<IconButton
									icon="arrow-right-drop-circle-outline"
									color={"#fff"}
									size={25}
								/>
								<Text style={[s.fcw, s.fs20]}>INICIAR ATENDIMENTO</Text>
							</TouchableOpacity>
						</View>
						<View style={s.fl1} />
					</View>
				</View>
				{carregando ? (
					<Loading size={95} />
				) : (
					<>
						{usuario?.associado_atendimento ? (
							<>
								<View
									style={[
										s.mh20,
										s.mv10,
										s.bgcw,
										s.pd20,
										s.br6,
										s.el1,
										{
											borderWidth:
												usuario?.associado_atendimento?.tipo === "01" ? 2 : 0,
											borderColor:
												usuario?.associado_atendimento?.tipo === "01"
													? "#07A85C"
													: "#fff",
										},
									]}
								>
									{usuario?.associado_atendimento?.status ? (
										<>
											<Text style={[s.fs20, s.bold]}>
												{usuario?.associado_atendimento?.nome} (
												{usuario?.associado_atendimento?.matricula})
											</Text>
											<Text style={[s.fs18]}>
												SITUAÇÃO ATUAL:{" "}
												<Text style={[s.bold, s.ml10]}>
													{usuario?.associado_atendimento?.tipo === "01"
														? "ASSOCIADO ABEPOM"
														: usuario?.associado_atendimento?.tipo === "31"
														? "ASSOCIADO SINPOFESC"
														: "NÃO ASSOCIADO - COM DADOS PRÉ-PREENCHIDOS"}
												</Text>
											</Text>
											{usuario?.associado_atendimento?.data_saida == 1 && (
												<Text style={[s.fcr, s.fs15]}>
													O ASSOCIADO DEVERÁ PAGAR JOIA
												</Text>
											)}
										</>
									) : (
										<>
											<Text style={[s.fs20, s.bold]}>
												MILITAR SEM REGISTRO COM A ABEPOM
											</Text>
										</>
									)}
								</View>
								<FlatList
									data={usuario?.associado_atendimento?.dependentes}
									keyExtractor={(item) => item.cont}
									numColumns={1}
									style={[s.fl1, s.mb20, s.mih200, s.mxh340, s.mh20]}
									renderItem={({ item }) => {
										return (
											<Dependente
												item={item}
												{...props}
												setDependenteEscolhido={setDependenteEscolhido}
												setModalExcluirDependente={setModalExcluirDependente}
											/>
										);
									}}
								/>
								{usuario?.associado_atendimento?.dependentes?.length > 3 ? (
									<View style={[s.row, s.jcc, s.aic, s.mb20]}>
										<Image
											source={images.seta}
											style={[s.w20, s.h20, s.tr90, , s.tcp]}
											tintColor={tema.colors.primary}
										/>
										<Text style={[s.fs15, s.ml10, s.fcp]}>
											ARRASTE PARA VER MAIS DEPENDENTES
										</Text>
									</View>
								) : null}
								<MenuInicio
									{...props}
									associado={usuario?.associado_atendimento}
								/>
							</>
						) : null}
					</>
				)}

				<View style={[s.bgcp, s.b0, s.psa, s.fullw, s.h60, s.jcc]}>
					<TouchableOpacity
						onPress={() => navigation.navigate("Sair")}
						style={[s.row, s.r0, s.psa, s.h60, s.w60, s.jcc, s.aic, s.zit]}
					>
						<Image
							source={images.sair}
							style={[s.w35, s.h35, s.tcw, s.mr10]}
							tintColor={"#fff"}
						/>
					</TouchableOpacity>
					<Text style={[s.fcw, s.tac]}>
						Versão: {app.expo.version.substring(0, 3)}
					</Text>
					<Text style={[s.fcw, s.tac]}>
						Usuário: <Text style={s.bold}>{usuario.nome}</Text>
					</Text>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default Inicio;
