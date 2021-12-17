import React, { useCallback, useState } from "react";
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Image,
	RefreshControl,
	ScrollView,
	Modal,
	Keyboard,
} from "react-native";
import { TextInput } from "react-native-paper";
import { MaskService, TextInputMask } from "react-native-masked-text";
import PickerModal from "react-native-picker-modal-view";
import NumberFormat from "react-number-format";
import imagens from "../utils/images";
import api from "../../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Messages from "../components/Messages";
import styles, { tema } from "../../assets/style/Style";
import Alert from "../components/Alert";
import { useUsuario } from "../store/Usuario";

const ASSOCIADO_INITIAL = {
	matricula: "",
	sexo: { Name: "", Value: "" },
	cidade: { Name: "", Value: "" },
	orgao: { Name: "", Value: "" },
	funcao: { Name: "", Value: "" },
	local_trabalho: { Name: "", Value: "" },
	banco: { Name: "", Value: "" },
	forma_desconto: { Name: "", Value: "" },
	valor_mensalidade: 0,
};

function ConsultarDescontos(props) {
	let data_atual = new Date();
	let total = 0;
	const [{ token }] = useUsuario();
	const [matricula, setMatricula] = useState("");
	const [associado, setAssociado] = useState(ASSOCIADO_INITIAL);
	const [carregando, setCarregando] = useState(false);
	const [mostrarDados, setMostrarDados] = useState(false);
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

					const response = await api({
						url: "/associados/descontosDoMes",
						method: "GET",
						params: {
							cartao: `${matricula}00001`,
							mes: ("0" + mes.Value).slice(-2),
							ano: ano.Value,
						},
						headers: { "x-access-token": token },
					});

					setDescontos([...response.data.descontos]);
					setMostrarDados(true);
				} else {
					setAssociado(ASSOCIADO_INITIAL);
					setDepndentes([]);
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

	async function abrirComposicaoParcelamento(controle) {
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
						{carregandoProcedimento ? (
							<Loading size={80} />
						) : (
							<ScrollView>
								{procedimentosCopart.map((procedimento, index) => (
									<View
										key={index}
										style={{
											flex: 1,
											marginVertical: 5,
											height: "100%",
											padding: 10,
											borderBottomColor:
												procedimentosCopart.length == index + 1
													? "#fff"
													: tema.colors.cinza,
											borderBottomWidth:
												procedimentosCopart.length == index + 1 ? 0 : 1,
										}}
									>
										<View>
											<Text style={{ color: tema.colors.primary, fontSize: 8 }}>
												PACIENTE:
											</Text>
											<Text
												style={{ color: tema.colors.primary, fontSize: 12 }}
											>
												{procedimento.paciente}
											</Text>
										</View>
										<View style={{ marginTop: 5 }}>
											<Text style={{ color: tema.colors.primary, fontSize: 8 }}>
												PROFISSIONAL:
											</Text>
											<Text
												style={{ color: tema.colors.primary, fontSize: 12 }}
											>
												{procedimento.profissional}
											</Text>
										</View>
										<View style={[styles.linha, { marginTop: 5 }]}>
											<View style={{ flex: 1 }}>
												<Text
													style={{ color: tema.colors.primary, fontSize: 8 }}
												>
													DATA DE REALIZAÇÃO:
												</Text>
												<Text
													style={{ color: tema.colors.primary, fontSize: 12 }}
												>
													{procedimento.data}
												</Text>
											</View>
											<View style={{ flex: 1, alignItems: "flex-end" }}>
												<Text
													style={{ color: tema.colors.primary, fontSize: 8 }}
												>
													VALOR
												</Text>
												<Text
													style={{ color: tema.colors.primary, fontSize: 14 }}
												>
													{MaskService.toMask("money", procedimento.valor)}
												</Text>
											</View>
										</View>
										<View style={{ marginTop: 5 }}>
											<Text style={{ color: tema.colors.primary, fontSize: 8 }}>
												PROCEDIMENTO:
											</Text>
											<Text
												style={{
													color: tema.colors.primary,
													fontSize: 12,
												}}
											>
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
					<Text
						style={{
							textAlign: "center",
							marginTop: 10,
							marginBottom: 20,
							fontSize: 17,
						}}
					>
						Consulte os descontos da matrícula informada abaixo.
					</Text>
					<View style={{ flex: 1 }}>
						<View style={{ flexDirection: "row" }}>
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
							<View style={{ flex: 1, marginHorizontal: 5 }}>
								<TextInput
									label="Mês"
									value={mes}
									mode="outlined"
									onChangeText={(texto) => setMes(texto)}
									style={{ marginBottom: 10, width: "100%", marginRight: 10 }}
									render={(props) => (
										<PickerModal
											renderSelectView={(disabled, selected, showModal) => (
												<TouchableOpacity
													style={[
														styles.linha,
														{
															flex: 1,
															justifyContent: "flex-start",
															alignItems: "center",
															paddingLeft: 10,
														},
													]}
													disabled={disabled}
													onPress={showModal}
												>
													<View style={{ flex: 3 }}>
														<Text>
															{mes.Name ? mes.Name : "SELECIONE O MÊS"}
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
															source={imagens.seta}
															tintColor={tema.colors.primary}
															style={{
																width: 10,
																height: 10,
																right: 0,
																tintColor: tema.colors.primary,
																transform: [{ rotate: "90deg" }],
															}}
														/>
													</View>
												</TouchableOpacity>
											)}
											modalAnimationType="fade" // TIPO DE ANIMAÇÃO: FADE / SLIDE OU NONE
											selected={mes}
											selectPlaceholderText="SELECIONE O MÊS" // TEXTO DO PLACEHOLDER
											searchPlaceholderText="Digite o nome do mês..." // TEXTO DE BUSCA
											onSelected={(key) => setMes(key)} // QUANDO SELECIONAR
											onClosed={() => {
												setMes({
													Name: `${
														meses.find(
															(mes) => mes.Value === data_atual.getMonth() + 1
														).Name
													}`,
													Value: data_atual.getMonth() + 1,
												});
											}}
											items={meses} // ITENS DO SELECT
										/>
									)}
								/>
							</View>
							<View style={{ flex: 1, marginHorizontal: 5 }}>
								<TextInput
									label="Ano"
									value={ano}
									mode="outlined"
									onChangeText={(texto) => setAno(texto)}
									style={{ marginBottom: 10, width: "100%", marginRight: 10 }}
									render={(props) => (
										<PickerModal
											renderSelectView={(disabled, selected, showModal) => (
												<TouchableOpacity
													style={[
														styles.linha,
														{
															flex: 1,
															justifyContent: "flex-start",
															alignItems: "center",
															paddingLeft: 10,
														},
													]}
													disabled={disabled}
													onPress={showModal}
												>
													<View style={{ flex: 3 }}>
														<Text>
															{ano.Name ? ano.Name : "SELECIONE O ANO"}
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
															source={imagens.seta}
															tintColor={tema.colors.primary}
															style={{
																width: 10,
																height: 10,
																right: 0,
																tintColor: tema.colors.primary,
																transform: [{ rotate: "90deg" }],
															}}
														/>
													</View>
												</TouchableOpacity>
											)}
											modalAnimationType="fade"
											selected={ano}
											selectPlaceholderText="SELECIONE O ANO"
											searchPlaceholderText="Digite o ano..."
											onSelected={(key) => setAno(key)}
											onClosed={() =>
												setAno({
													Name: `${data_atual.getFullYear()}`,
													Value: data_atual.getFullYear(),
												})
											}
											items={anos}
										/>
									)}
								/>
							</View>
							<View>
								<TouchableOpacity
									style={{
										backgroundColor: tema.colors.primary,
										marginTop: 5,
										padding: 18,
										borderRadius: 6,
										marginLeft: 5,
									}}
									onPress={() => carregarDescontos()}
								>
									<Image
										source={imagens.buscar}
										style={{ width: 25, height: 25, tintColor: "#fff" }}
										tintColor={"#fff"}
									/>
								</TouchableOpacity>
							</View>
						</View>
						<View style={{ flex: 1 }}>
							{carregando ? (
								<View style={[styles.centralizado, { flex: 1 }]}>
									<Loading size={120} />
								</View>
							) : (
								<>
									{mostrarDados && (
										<ScrollView style={styles.containerScroll}>
											{associado.status && (
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
											)}
											{descontos.length > 0 ? (
												descontos.map((desconto, index) => {
													desconto.pago
														? (total += 0)
														: desconto.valor_parcela
														? (total += desconto.valor_parcela)
														: (total += desconto.total);

													return (
														<View
															key={index}
															style={[
																styles.blocoScroll,
																{
																	height: "100%",
																	padding: 10,
																	borderColor: desconto.pago
																		? tema.colors.verde
																		: "#f1f1f1",
																	borderWidth: desconto.pago ? 1 : 0,
																	overflow: "hidden",
																},
															]}
														>
															<View style={{ flex: 1, marginBottom: 5 }}>
																{desconto.nome_prestador ? (
																	<Text
																		style={{
																			fontSize: 16,
																			fontWeight: "bold",
																			textAlign: "left",
																		}}
																	>
																		{desconto.nome_prestador
																			.toUpperCase()
																			.trim()}
																	</Text>
																) : null}
															</View>
															<View style={styles.linha}>
																<View style={{ flex: 2 }}>
																	<Text style={{ fontSize: 12 }}>
																		{desconto.nome}
																	</Text>
																	<Text style={{ fontSize: 11 }}>
																		{desconto.data_utilizacao}
																	</Text>
																	{desconto.mesano_primeiro.length > 0 ? (
																		<Text style={{ fontSize: 11 }}>
																			1º DESC.: {desconto.mesano_primeiro}
																		</Text>
																	) : null}
																	{desconto.procedimento.length > 0 ? (
																		<Text style={{ fontSize: 11 }}>
																			{desconto.procedimento}
																		</Text>
																	) : null}
																	{(desconto.filtro === 4 ||
																		desconto.filtro === 1 ||
																		desconto.filtro === 2) &&
																	desconto.area.length > 0 ? (
																		<Text style={{ fontSize: 11 }}>
																			{desconto.area}
																		</Text>
																	) : null}
																</View>
																<View
																	style={{
																		flex: 1,
																		alignItems: "flex-end",
																		justifyContent: "flex-start",
																	}}
																>
																	<NumberFormat
																		value={
																			desconto.valor_parcela
																				? desconto.valor_parcela
																				: desconto.total
																		}
																		displayType={"text"}
																		thousandSeparator="."
																		decimalSeparator=","
																		decimalScale={2}
																		fixedDecimalScale
																		prefix={"R$ "}
																		renderText={(value) => (
																			<Text
																				style={{
																					fontSize: 16,
																					fontWeight: "bold",
																				}}
																			>
																				{value}
																			</Text>
																		)}
																	/>
																	{desconto.quantidade > 1 ? (
																		<NumberFormat
																			value={desconto.total}
																			displayType={"text"}
																			thousandSeparator="."
																			decimalSeparator=","
																			decimalScale={2}
																			fixedDecimalScale
																			prefix={"R$ "}
																			renderText={(value) => (
																				<Text style={{ fontSize: 11 }}>
																					{`${value} em ${desconto.quantidade}x`}
																					{desconto.filtro === 7 && `*`}
																				</Text>
																			)}
																		/>
																	) : null}
																	{desconto.plano.length > 0 ? (
																		<Text style={{ fontSize: 11 }}>
																			{desconto.plano}
																		</Text>
																	) : null}
																	{desconto.pago ? (
																		<>
																			<Text
																				style={{
																					fontSize: 10,
																					color: tema.colors.verde,
																				}}
																			>
																				QUITADO
																			</Text>
																			<Text
																				style={{
																					fontSize: 9,
																					color: tema.colors.verde,
																				}}
																			>
																				NÃO SOMADO NO TOTAL
																			</Text>
																		</>
																	) : null}
																</View>
															</View>
															{desconto.filtro === 7 ? (
																<Text style={{ fontSize: 10, paddingTop: 3 }}>
																	* Pode ocorrer de que este parcelamento seja a
																	junção de diversos valores de coparticipação.
																</Text>
															) : null}
															{desconto.filtro === 7 ? (
																<TouchableOpacity
																	onPress={() =>
																		abrirComposicaoParcelamento(
																			desconto.procedimento
																		)
																	}
																	style={{
																		backgroundColor: tema.colors.primary,
																		marginTop: 4,
																		padding: 5,
																		borderRadius: 6,
																	}}
																>
																	<Text
																		style={{
																			color: "#fff",
																			textAlign: "center",
																			fontSize: 10,
																		}}
																	>
																		COMPOSIÇÃO DO PARCELAMENTO
																	</Text>
																</TouchableOpacity>
															) : null}
														</View>
													);
												})
											) : !associado.status ? (
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
											<View style={{ height: 60 }}></View>
										</ScrollView>
									)}
								</>
							)}
						</View>
					</View>
				</View>
				<View
					style={[
						styles.containerTotal,
						styles.centralizado,
						{ height: 80, paddingVertical: 5 },
					]}
				>
					<View
						style={[
							styles.linha,
							styles.centralizado,
							{ flex: 1, width: "100%" },
						]}
					>
						<Text
							style={{
								color: "#fff",
								fontSize: 20,
							}}
						>
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
								<Text
									style={{
										color: "#fff",
										fontSize: 20,
										fontWeight: "bold",
										marginLeft: 10,
									}}
								>
									{value}
								</Text>
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
