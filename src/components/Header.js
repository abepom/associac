import React from "react";
import { Platform, View, TouchableOpacity, Image, Text } from "react-native";
import Constants from "expo-constants";
import s, { tema } from "../../assets/style/Style";
import imagens from "../utils/images";

function Header(props) {
	const { navigation } = props;

	return (
		<>
			<View
				style={[
					s.row,
					s.bgcp,
					s.fullw,
					{
						height: Platform.OS === "ios" ? 60 + Constants.statusBarHeight : 60,
						paddingTop: Platform.OS == "ios" ? Constants.statusBarHeight : 0,
					},
				]}
			>
				<View style={[s.jcc, s.aic, s.fl1]}>
					<TouchableOpacity
						style={[s.fullw, s.fullh, s.jcc, s.aic]}
						onPress={() =>
							props.voltar
								? navigation.navigate(
										props.voltarPara.name,
										props.voltarPara.params
								  )
								: navigation.goBack()
						}
					>
						<Image
							source={imagens.seta}
							style={[s.w25, s.h25, s.tr180, s.tcw]}
							tintColor={tema.colors.background}
						/>
					</TouchableOpacity>
				</View>
				<View style={[s.jcc, s.aic, s.row, s.fl4]}>
					<View style={s.pdr10}>
						<Image source={imagens.logo_abepom} style={[s.w35, s.h35]} />
					</View>
					<View style={[s.jcc, s.aic]}>
						{props.titulo.length > 21 ? (
							<View style={s.row}>
								<Text style={[s.fcw, s.fs15]}>
									{props.titulo.substring(0, 26)}
								</Text>
								{props.titulo.length > 26 ? (
									<Text style={[s.fcw, s.fs10, s.tavb]}>...</Text>
								) : null}
							</View>
						) : (
							<Text style={[s.fcw, s.fs20]}>{props.titulo}</Text>
						)}
						{!!props.subtitulo ? (
							<Text style={[s.fcw, s.fs11]}>{props.subtitulo}</Text>
						) : null}
					</View>
				</View>
				<View style={[s.jcc, s.aic, s.fl1]}>
					<View></View>
				</View>
			</View>
		</>
	);
}

export default Header;
