import React from "react";
import { Dimensions, Text, View } from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import LottieView from "lottie-react-native";
import s, { tema } from "../../assets/style/Style";

//https://lottiefiles.com/share/xd0c8rja
//https://iconscout.com/lotties/success?price=free

function Alert(props) {
	const { alerta, setAlerta } = props;

	const {
		visible = false,
		title = "ATENÇÃO!",
		message = "Ocorreu um erro ao tentar executar a função.",
		type = "danger",
		showCancel = true,
		cancelText = "FECHAR",
		showConfirm = false,
		confirmText = "OK!",
		confirmFunction = () => hideAlert(),
		closeOnTouch = false,
		showIcon = true,
		width = "90%",
	} = alerta;

	let icon = { caminho: "", largura: 250, altura: 250 };
	let confirmColor = tema.colors.primary;

	switch (type) {
		case "success":
			icon = {
				caminho: require(`../../assets/img/alert-success.json`),
				largura: 180,
				altura: 180,
			};

			confirmColor = tema.colors.verde;
			break;
		case "warning":
			icon = {
				caminho: require(`../../assets/img/alert-warning.json`),
				largura: 180,
				altura: 180,
			};

			confirmColor = tema.colors.amarelo;

			break;
		case "danger":
			icon = {
				caminho: require(`../../assets/img/alert-danger.json`),
				largura: 150,
				altura: 150,
			};

			confirmColor = tema.colors.vermelho;

			break;
		default:
			icon = { caminho: require(`../../assets/img/alert-success.json`) };
			break;
	}

	const hideAlert = () => {
		return setAlerta({ ...alerta, visible: false });
	};

	return (
		<>
			<AwesomeAlert
				show={visible}
				showProgress={false}
				title={title}
				message={
					<View style={[s.fl1, s.aic]}>
						{showIcon && (
							<LottieView
								source={icon.caminho}
								autoPlay
								loop={false}
								style={{
									width: icon.largura,
									height: icon.altura,
									width: Dimensions.get("screen").width - 230,
								}}
							/>
						)}
						<View style={[s.row, s.flg1, { maxWidth: 650 }]}>
							<Text style={[s.fl1, s.tac, s.mb20, s.fs18]}>{message}</Text>
						</View>
					</View>
				}
				closeOnTouchOutside={closeOnTouch}
				closeOnHardwareBackPress={false}
				showCancelButton={showCancel}
				showConfirmButton={showConfirm}
				cancelText={cancelText}
				confirmText={confirmText}
				onCancelPressed={() => hideAlert()}
				onConfirmPressed={confirmFunction}
				contentContainerStyle={{ width }}
				overlayStyle={s.bgcp + "DD"}
				titleStyle={[
					s.fullw,
					s.tac,
					s.bbw1,
					s.bbcc,
					s.pdb20,
					s.mb20,
					s.fs25,
					s.bold,
				]}
				messageStyle={[s.aic, s.acc]}
				confirmButtonStyle={{ backgroundColor: confirmColor }}
				confirmButtonTextStyle={[s.fs20, s.m10, s.fcw]}
				cancelButtonStyle={{ backgroundColor: tema.colors.backdrop }}
				cancelButtonTextStyle={[s.fs20, s.m10, s.fcw]}
			/>
		</>
	);
}

export default Alert;
