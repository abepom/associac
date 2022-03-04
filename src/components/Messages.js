import React from "react";
import { View, Text, Image } from "react-native";
import s, { tema } from "../../assets/style/Style";
import imagens from "../utils/images";

export default (props) => {
	return (
		<>
			<View
				style={[
					props.style,
					s.fl1,
					s.h100,
					s.bgcw,
					s.mv6,
					s.br6,
					s.el1,
					s.row,
					s.fullh,
					s.jcc,
					s.pd20,
					{
						backgroundColor: !!props.cor ? props.cor : tema.colors.verde,
					},
				]}
			>
				<View style={[s.fl1, s.jcc]}>
					<Image
						source={!!props.imagem ? props.imagem : imagens.sucesso}
						style={[s.w40, s.h40, s.tcw]}
						tintColor={tema.colors.background}
					/>
				</View>
				<View style={[s.fl10, s.jcc]}>
					<Text style={[s.bold, s.fcw]}>{props.titulo.toUpperCase()}</Text>
					{props.subtitulo ? (
						<Text
							style={[
								s.fcw,
								{
									fontSize: props.tamanhoSubtitulo
										? props.tamanhoSubtitulo
										: 10,
								},
							]}
						>
							{props.subtitulo}
						</Text>
					) : null}
				</View>
			</View>
		</>
	);
};
