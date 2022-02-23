import React, { useState } from "react";
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Image,
	ScrollView,
	Modal,
	Keyboard,
} from "react-native";
import { TextInput } from "react-native-paper";
import { MaskService } from "react-native-masked-text";
import PickerModal from "react-native-picker-modal-view";
import NumberFormat from "react-number-format";
import api from "../../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Messages from "../components/Messages";
import s, { tema } from "../../assets/style/Style";
import Alert from "../components/Alert";
import { useUsuario } from "../store/Usuario";
import Combo from "../components/Combo";
import images from "../utils/images";

function ConsultarDescontos(props) {
	let data_atual = new Date();
	let total = 0;
	const [{ token, associado_atendimento }] = useUsuario();
	const [mostrarDados, setMostrarDados] = useState(false);
	const [carregando, setCarregando] = useState(false);
	const [descontos, setDescontos] = useState([]);
	const [modalComposicaoParcelamento, setModalComposicaoParcelamento] =
		useState(false);
	const [procedimentosCopart, setProcedimentosCopart] = useState([]);
	const [carregandoProcedimento, setCarregandoProcedimento] = useState(false);
	const [alerta, setAlerta] = useState({});

	const meses = [
		{ Name: "JANEIRO", Value: 1 },
		{ Name: "FEVEREIRO", Value: 2 },
		{ Name: "MARÇO", Value: 3 },
		{ Name: "ABRIL", Value: 4 },
		{ Name: "MAIO", Value: 5 },
		{ Name: "JUNHO", Value: 6 },
		{ Name: "JULHO", Value: 7 },
		{ Name: "AGOSTO", Value: 8 },
		{ Name: "SETEMBRO", Value: 9 },
		{ Name: "OUTUBRO", Value: 10 },
		{ Name: "NOVEMBRO", Value: 11 },
		{ Name: "DEZEMBRO", Value: 12 },
	];

	const anos = [];

	for (let i = data_atual.getFullYear(); i >= 1993; i--) {
		anos.push({ Name: `${i}`, Value: i });
	}

	const [mes, setMes] = useState({
		Name: `${
			meses.find((mes) => mes.Value === data_atual.getMonth() + 1).Name
		}`,
		Value: data_atual.getMonth() + 1,
	});

	const [ano, setAno] = useState({
		Name: `${data_atual.getFullYear()}`,
		Value: data_atual.getFullYear(),
	});

	async function carregarDescontos() {
		if (associado_atendimento.matricula !== "") {
			setCarregando(true);

			try {
				const response = await api({
					url: "/associados/descontosDoMes",
					method: "GET",
					params: {
						cartao: `${associado_atendimento.matricula}00001`,
						mes: ("0" + mes.Value).slice(-2),
						ano: ano.Value,
					},
					headers: { "x-access-token": token },
				});

				setDescontos([...response.data.descontos]);
				setMostrarDados(true);
				setCarregando(false);
				Keyboard.dismiss();
			} catch (error) {
				Keyboard.dismiss();
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Ocorreu um erro ao carregar os descontos.",
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
	}

	async function abrirParcelamento(controle) {
		setCarregandoProcedimento(true);
		setModalComposicaoParcelamento(true);

		try {
			const { data } = await api({
				url: "/associados/procedimentosCoparticipacao",
				method: "GET",
				params: {
					controle: controle.replace("CD: ", ""),
				},
				headers: { "x-access-token": token },
			});

			setProcedimentosCopart(data.procedimentos);
			setCarregandoProcedimento(false);
		} catch (error) {
			setProcedimentosCopart([]);
			setCarregandoProcedimento(false);
		}
	}

	return (
		<>
			<Header titulo={"Consultar Descontos"} {...props} />
			<Modal
				animationType="fade"
				transparent={true}
				visible={modalComposicaoParcelamento}
				{...props}
			>
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
						{carregandoProcedimento ? (
							<Loading size={80} />
						) : (
							<ScrollView>
								{procedimentosCopart.map((procedimento, index) => (
									<View
										key={index}
										style={[
											s.fl1,
											s.mv6,
											s.fullh,
											s.pd10,
											{
												borderBottomColor:
													procedimentosCopart.length == index + 1
														? "#fff"
														: tema.colors.cinza,
												borderBottomWidth:
													procedimentosCopart.length == index + 1 ? 0 : 1,
											},
										]}
									>
										<View>
											<Text style={[s.fs8, s.fcp]}>PACIENTE:</Text>
											<Text style={[s.fs12, s.fcp]}>
												{procedimento.paciente}
											</Text>
										</View>
										<View style={s.mt5}>
											<Text style={[s.fs8, s.fcp]}>PROFISSIONAL:</Text>
											<Text style={[s.fs12, s.fcp]}>
												{procedimento.profissional}
											</Text>
										</View>
										<View style={[s.row, s.mt5]}>
											<View style={{ flex: 1 }}>
												<Text style={[s.fs8, s.fcp]}>DATA DE REALIZAÇÃO:</Text>
												<Text style={[s.fs12, s.fcp]}>{procedimento.data}</Text>
											</View>
											<View style={[s.fl1, s.aife]}>
												<Text style={[s.fcp, s.fs8]}>VALOR</Text>
												<Text style={[s.fcp, s.fs15]}>
													{MaskService.toMask("money", procedimento.valor)}
												</Text>
											</View>
										</View>
										<View style={s.mt5}>
											<Text style={[s.fs8, s.fcp]}>PROCEDIMENTO:</Text>
											<Text style={[s.fcp, s.fs12]}>
												{procedimento.procedimento}
											</Text>
										</View>
									</View>
								))}
							</ScrollView>
						)}
					</View>
					<TouchableOpacity
						onPress={() => setModalComposicaoParcelamento(false)}
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
					<View style={s.fl1}>
						<View style={s.row}>
							<View style={[s.fl1, s.mh5, s.mb20]}>
								<Combo
									label={"Mês"}
									pronome={"o"}
									lista={meses}
									item={[mes, setMes]}
								/>
							</View>
							<View style={[s.fl1, s.mh5]}>
								<Combo
									label={"Ano"}
									pronome={"o"}
									lista={anos}
									item={[ano, setAno]}
								/>
							</View>
							<View>
								<TouchableOpacity
									style={[s.bgcp, s.mt5, s.pd17, s.br6, s.ml5]}
									onPress={() => carregarDescontos()}
								>
									<Image
										source={images.buscar}
										style={[s.w25, s.h25, s.tcw]}
										tintColor={tema.colors.background}
									/>
								</TouchableOpacity>
							</View>
						</View>
						<View style={s.fl1}>
							{carregando ? (
								<View style={[s.jcc, s.aic, s.fl1]}>
									<Loading size={120} />
								</View>
							) : (
								<>
									{mostrarDados && (
										<>
											<View
												style={[
													s.fullw,
													s.bgcw,
													s.br6,
													s.pd20,
													s.mb20,
													s.el3,
													s.row,
												]}
											>
												<View style={s.fl1}>
													<Text style={s.bold}>
														{associado_atendimento.nome}
													</Text>
													{associado_atendimento.tipo === "01" ? (
														<Text style={s.fcg}>ASSOCIADO ABEPOM</Text>
													) : associado_atendimento.tipo === "31" ? (
														<Text style={s.fcr}>NÃO ASSOCIADO</Text>
													) : (
														<Text style={s.fcg}>ASSOCIADO SINPOFESC</Text>
													)}
												</View>
												<View style={s.fl1}>
													<Text style={s.tar}>
														Nascimento: {associado_atendimento.nascimento}
													</Text>
													<Text style={s.tar}>
														{associado_atendimento.email}
													</Text>
												</View>
											</View>
											<ScrollView style={[s.fl1, s.fullw, s.mah90p, s.mv10]}>
												{descontos.length > 0 ? (
													descontos.map((desc, index) => {
														desc.pago
															? (total += 0)
															: desc.valor_parcela
															? (total += desc.valor_parcela)
															: (total += desc.total);

														return (
															<View
																key={index}
																style={[
																	s.fl1,
																	s.h100,
																	s.bgcw,
																	s.mv6,
																	s.br6,
																	s.el1,
																	s.fullh,
																	s.pd10,
																	s.ofh,
																	{
																		borderColor: desc.pago
																			? tema.colors.verde
																			: "#f1f1f1",
																		borderWidth: desc.pago ? 1 : 0,
																	},
																]}
															>
																<View style={[s.fl1, s.mb5]}>
																	{desc.nome_prestador ? (
																		<Text style={[s.fs15, s.bold, s.tal]}>
																			{desc.nome_prestador.toUpperCase().trim()}
																		</Text>
																	) : null}
																</View>
																<View style={s.row}>
																	<View style={s.fl2}>
																		<Text style={s.fs12}>{desc.nome}</Text>
																		<Text style={s.fs11}>
																			{desc.data_utilizacao}
																		</Text>
																		{desc.mesano_primeiro.length > 0 ? (
																			<Text style={s.fs11}>
																				1º DESC.: {desc.mesano_primeiro}
																			</Text>
																		) : null}
																		{desc.procedimento.length > 0 ? (
																			<Text style={s.fs11}>
																				{desc.procedimento}
																			</Text>
																		) : null}
																		{(desc.filtro === 4 ||
																			desc.filtro === 1 ||
																			desc.filtro === 2) &&
																		desc.area.length > 0 ? (
																			<Text style={s.fs11}>{desc.area}</Text>
																		) : null}
																	</View>
																	<View style={[s.fl1, s.aife, s.jcfs]}>
																		<NumberFormat
																			value={
																				desc.valor_parcela
																					? desc.valor_parcela
																					: desc.total
																			}
																			displayType={"text"}
																			thousandSeparator="."
																			decimalSeparator=","
																			decimalScale={2}
																			fixedDecimalScale
																			prefix={"R$ "}
																			renderText={(value) => (
																				<Text style={[s.fs15, s.bold]}>
																					{value}
																				</Text>
																			)}
																		/>
																		{desc.quantidade > 1 ? (
																			<NumberFormat
																				value={desc.total}
																				displayType={"text"}
																				thousandSeparator="."
																				decimalSeparator=","
																				decimalScale={2}
																				fixedDecimalScale
																				prefix={"R$ "}
																				renderText={(value) => (
																					<Text style={s.fs10}>
																						{`${value} em ${desc.quantidade}x`}
																						{desc.filtro === 7 && `*`}
																					</Text>
																				)}
																			/>
																		) : null}
																		{desc.plano.length > 0 ? (
																			<Text style={s.fs10}>{desc.plano}</Text>
																		) : null}
																		{desc.pago ? (
																			<>
																				<Text style={[s.fs10, s.fcg]}>
																					QUITADO
																				</Text>
																				<Text style={[s.fs10, s.fcg]}>
																					NÃO SOMADO NO TOTAL
																				</Text>
																			</>
																		) : null}
																	</View>
																</View>
																{desc.filtro === 7 ? (
																	<Text style={[s.fs10, s.pdt5]}>
																		* Pode ocorrer de que este parcelamento seja
																		a junção de diversos valores de
																		coparticipação.
																	</Text>
																) : null}
																{desc.filtro === 7 ? (
																	<TouchableOpacity
																		onPress={() =>
																			abrirParcelamento(desc.procedimento)
																		}
																		style={[s.bgcp, s.mt5, s.pd5, s.br6]}
																	>
																		<Text style={[s.fcw, s.tac, s.fs10]}>
																			COMPOSIÇÃO DO PARCELAMENTO
																		</Text>
																	</TouchableOpacity>
																) : null}
															</View>
														);
													})
												) : !associado_atendimento.status ? (
													<Messages
														titulo={`MATRÍCULA INVÁLIDA!`}
														subtitulo="A matrícula informada não foi encontrada ou está inválida."
														cor={tema.colors.vermelho}
													/>
												) : (
													<Messages
														titulo={`NÃO HÁ DESCONTOS!`}
														subtitulo="Não há nenhum desconto para o mês/ano e matrícula informada."
													/>
												)}
												<View style={s.h60}></View>
											</ScrollView>
											{}
											<View style={[s.row, s.jcc, s.aic, s.mb20]}>
												<Image
													source={images.seta}
													style={[s.w20, s.h20, s.tr90, , s.tcp]}
													tintColor={tema.colors.primary}
												/>
												<Text style={[s.fs15, s.ml10, s.fcp]}>
													ARRASTE PARA VER MAIS DESCONTOS
												</Text>
											</View>
										</>
									)}
								</>
							)}
						</View>
					</View>
				</View>
				<View style={[s.fullw, s.h80, s.b0, s.bgcp, s.jcc, s.aic, s.pdv10]}>
					<View style={[s.row, s.aic, s.jcc, s.fl1, s.fullw]}>
						<Text style={[s.fs20, s.fcw]}>
							TOTAL DE {("0" + mes.Value).slice(-2)}/{ano.Value}:
						</Text>
						<NumberFormat
							value={total}
							displayType={"text"}
							thousandSeparator="."
							decimalSeparator=","
							decimalScale={2}
							fixedDecimalScale
							prefix={"R$ "}
							renderText={(value) => (
								<Text style={[s.fcw, s.fs20, s.bold, s.ml10]}>{value}</Text>
							)}
						/>
					</View>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default ConsultarDescontos;
