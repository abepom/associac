import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import s, { tema } from "../../assets/style/Style";
import api from "../../services/api";
import { useUsuario } from "../store/Usuario";
import images from "../utils/images";

export default (props) => {
	const [{ associado_atendimento, token }] = useUsuario();
	const { item, setModal, setCarregar, setLink } = props;

	async function abrirRequerimento(arquivo) {
		setModal(true);
		setCarregar(true);

		const { data } = await api({
			url: "/visualizarArquivoAssociac",
			method: "POST",
			data: {
				matricula: associado_atendimento.matricula,
				arquivo: arquivo.toString(),
			},
			headers: { "x-access-token": token },
		});

		setLink(data.caminho);
		setCarregar(false);
	}

	return (
		<TouchableOpacity
			onPress={() => abrirRequerimento(item.local_documento)}
			style={[s.bgcw, s.el1, s.br6, s.flg1, s.mv6, s.pd20, s.row]}
		>
			<View style={s.fl8}>
				<Text style={[s.fs20, s.fcp, s.bold]}>{item.nome.toUpperCase()}</Text>
				<Text style={[s.fs15, s.fcp]}>
					DOCUMENTO: {item.nome_documento.toUpperCase()}
				</Text>
				<Text style={[s.fs12, s.fcp]}>
					COMPLEMENTO: {item.complemento_desc.toUpperCase()}
				</Text>
				<Text style={[s.fs12, s.fcp]}>
					USUÁRIO DE INCLUSÃO: {item.usuario_inclusao.toUpperCase()}
				</Text>
			</View>
			<View style={[s.fl2, s.jcc, s.aic]}>
				<Text style={[s.fs15, s.fcp, s.tac]}>
					INCLUÍDO EM{`\n`}
					{item.data_inclusao}
				</Text>
			</View>
			<View style={[s.fl1, s.jcc, s.aic]}>
				<Image
					source={images.file}
					style={[s.w50, s.h50, s.tcp]}
					tintColor={tema.colors.primary}
				/>
			</View>
		</TouchableOpacity>
	);
};
