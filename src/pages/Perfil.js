import React, { useState, useRef } from "react";
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
import { Button, IconButton, TextInput } from "react-native-paper";
import { TextInputMask } from "react-native-masked-text";
import Header from "../components/Header";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import Input from "../components/Input";
import WebView from "react-native-webview";
import MenuInicio from "../components/MenuInicio";
import Dependente from "../components/Dependente";
import compararValores from "../functions/compararValores";
import Signature from "react-native-signature-canvas";
import api from "../../services/api";
import * as Print from "expo-print";

function Perfil(props) {
	const refColab = useRef();
	const [usuario, setUsuario] = useUsuario();
	const [assinatura, setAssinatura] = useState("");
	const [alerta, setAlerta] = useState({ visible: false });

	const handleClear = () => {
		refColab.current.clearSignature();
	};

	const handleOK = (signature) => {
		setAssinatura(signature);

		return true;
	};
	const handleEnd = () => {
		refColab.current.readSignature();
	};

	const handleConfirm = () => {
		if (assinatura !== "") {
			setAlerta({
				visible: true,
				title: "CADASTRANDO ASSINATURA",
				message: <Loading size={125} />,
				showConfirm: false,
				showCancel: false,
				showIcon: false,
			});

			salvarAssinatura();
		} else {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: `Para prosseguir é necessário solicitar${"\n"}a assinatura ao associado.`,
				type: "warning",
				showConfirm: true,
				showCancel: false,
				confirmText: "FECHAR",
			});
		}
	};

	const salvarAssinatura = async () => {
		try {
			const { data } = await api({
				url: "/intranet/cadastrarAssinaturaUsuario",
				method: "POST",
				data: { assinatura },
				headers: { "x-access-token": usuario.token },
			});

			if (data.status) {
				setUsuario({ ...usuario, assinatura });
			}

			setAlerta({
				visible: true,
				title: data.title,
				message: data.message,
				type: data.status ? "success" : "danger",
				showConfirm: true,
				showCancel: false,
				confirmText: "FECHAR",
			});
		} catch (error) {
			setAlerta({ visible: false });
		}
	};

	return (
		<>
			<Header titulo={"Perfil do Usuário"} {...props} />
			<SafeAreaView style={s.fl1}>
				<View style={[s.fl1, s.m20]}>
					{usuario?.assinatura?.length > 0 && (
						<View style={[s.fl1, s.aic, s.mt20]}>
							<Text style={s.tac}>Assinatura atual de</Text>
							<Text style={[s.tac, s.bold]}>
								{usuario?.nome?.toUpperCase()}
							</Text>
							<Image
								source={{ uri: usuario.assinatura }}
								style={{ width: 350, height: 150 }}
							/>
						</View>
					)}
					<View style={s.fl2}>
						<Text style={s.tac}>Assinatura de</Text>
						<Text style={[s.tac, s.bold]}>{usuario?.nome?.toUpperCase()}</Text>
						<Signature
							ref={refColab}
							style={s.h150}
							onOK={handleOK}
							onEmpty={() =>
								setAlerta({
									visible: true,
									title: "ATENÇÃO!",
									message:
										"Para confirmar é necessário preencher a sua assinatura.",
									showCancel: false,
									showConfirm: true,
									confirmText: "FECHAR",
								})
							}
							onEnd={handleEnd}
							descriptionText=""
							webStyle={`
                            html {background: #f1f1f1}
                            .m-signature-pad {width: 80%; height: 250px; margin-left: auto; margin-right: auto; margin-top: 10px; margin-bottom: 0px; }
                            .m-signature-pad::before{
                                position: absolute;
                                top: 210px;
                                content: " ";
                                width: 70%;
                                background: #aaa;
                                height:2px;
                                left: 15%;
                                right: 15%;
                            }
                            .m-signature-pad--body {border: none;}
                            .m-signature-pad--footer{ display: none;}
                            `}
						/>
						<View style={[s.row, s.aic, s.mh20, s.mb50]}>
							<TouchableOpacity
								style={[
									s.row,
									s.fl1,
									s.m0,
									s.pd15,
									s.br6,
									s.jcc,
									s.aic,
									s.bgcr,
									s.mr10,
								]}
								onPress={handleClear}
							>
								<Image
									source={images.trash}
									style={[s.w20, s.h20, s.tcw]}
									tintColor={tema.colors.background}
								/>
								<Text style={[s.fcw, s.ml10]}>LIMPAR ASSINATURA</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									s.row,
									s.fl1,
									s.m0,
									s.pd15,
									s.br6,
									s.jcc,
									s.aic,
									s.bgcg,
									s.mr10,
								]}
								onPress={handleConfirm}
							>
								<Image
									source={images.sucesso}
									style={[s.w20, s.h20, s.tcw]}
									tintColor={tema.colors.background}
								/>
								<Text style={[s.fcw, s.ml10]}>CONFIRMAR ASSINATURA</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</SafeAreaView>
			{alerta.visible && (
				<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
			)}
		</>
	);
}

export default Perfil;
