import axios from "axios";
import { AsyncStorage } from "react-native";

let retorno = "";
let data;
let token;

const conexao = {
	associados: axios.create({
		baseURL: "http://apiteste.abepom.org.br:3917/associados/",
	}),
	convenios: axios.create({
		baseURL: "http://apiteste.abepom.org.br:3917/convenios/",
	}),
	geral: axios.create({
		baseURL: "http://apiteste.abepom.org.br:3917/",
	}),
	intranet: axios.create({
		baseURL: "http://apiteste.abepom.org.br:3917/intranet/",
	}),
};

conexao.associados.interceptors.request.use(async (config) => {
	data = await AsyncStorage.getItem("usuario");

	if (data) {
		token = JSON.parse(data).usuario.token;

		if (token) {
			conexao.associados.defaults.headers = { "x-access-token": token };
		}
	}

	return config;
});

conexao.convenios.interceptors.request.use(async (config) => {
	data = await AsyncStorage.getItem("usuario");

	if (data) {
		token = JSON.parse(data).usuario.token;

		if (token) {
			conexao.convenios.defaults.headers = { "x-access-token": token };
		}
	}

	return config;
});

conexao.geral.interceptors.request.use(async (config) => {
	data = await AsyncStorage.getItem("usuario");

	if (data) {
		token = JSON.parse(data).usuario.token;

		if (token) {
			conexao.geral.defaults.headers = { "x-access-token": token };
		}
	}

	return config;
});

conexao.intranet.interceptors.request.use(async (config) => {
	data = await AsyncStorage.getItem("usuario");

	if (data) {
		token = JSON.parse(data).usuario.token;

		if (token) {
			conexao.intranet.defaults.headers = { "x-access-token": token };
		}
	}

	return config;
});

const associados = {
	post: async function (rota, dados, contentType = "application/json") {
		await conexao.associados
			.post(rota, dados, {
				headers: { "Content-Type": contentType },
			})
			.then((response) => {
				retorno = response;
			})
			.catch(function (error) {
				if (error.response) {
					// error.response.status = verificar o status do retorno;
					retorno = error.response;
				} else if (error.request) {
					retorno = {
						status: false,
						title: "ATENÇÃO!",
						message: "Não houve retorno do servidor para a sua requisição.",
					};
				} else {
					retorno = {
						status: false,
						title: "ATENÇÃO!",
						message: error.message,
					};
				}
			});

		return retorno;
	},
	get: async function (rota, dados, contentType = "application/json") {
		await conexao.associados
			.get(
				rota,
				{ params: dados },
				{
					headers: { "Content-Type": contentType },
				}
			)
			.then((response) => {
				retorno = response;
			})
			.catch(function (error) {
				if (error.response) {
					// error.response.status = verificar o status do retorno;
					retorno = error.response;
				} else if (error.request) {
					retorno = {
						title: "ATENÇÃO!",
						message: "Não houve retorno do servidor para a sua requisição.",
					};
				} else {
					retorno = error.message;
				}
			});

		return retorno;
	},
};

const geral = {
	post: async function (rota, dados) {
		await conexao.geral
			.post(rota, dados, {
				headers: { "Content-Type": "application/json" },
			})
			.then((response) => {
				retorno = response;
			})
			.catch(function (error) {
				if (error.response) {
					// error.response.status = verificar o status do retorno;
					retorno = error.response;
				} else if (error.request) {
					retorno = {
						status: false,
						title: "ATENÇÃO!",
						message: "Não houve retorno do servidor para a sua requisição.",
					};
				} else {
					retorno = {
						status: false,
						title: "ATENÇÃO!",
						message: error.message,
					};
				}
			});

		return retorno;
	},
	get: async function (rota, dados) {
		await conexao.geral
			.get(
				rota,
				{ params: dados },
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			)
			.then((response) => {
				retorno = response;
			})
			.catch(function (error) {
				if (error.response) {
					// error.response.status = verificar o status do retorno;
					retorno = error.response;
				} else if (error.request) {
					retorno = {
						title: "ATENÇÃO!",
						message: "Não houve retorno do servidor para a sua requisição.",
					};
				} else {
					retorno = error.message;
				}
			});

		return retorno;
	},
};

const convenios = {
	post: async function (rota, dados) {
		await conexao.convenios
			.post(rota, dados, {
				headers: { "Content-Type": "application/json" },
			})
			.then((response) => {
				retorno = response;
			})
			.catch(function (error) {
				if (error.response) {
					// error.response.status = verificar o status do retorno;
					retorno = error.response;
				} else if (error.request) {
					retorno = {
						status: false,
						title: "ATENÇÃO!",
						message: "Não houve retorno do servidor para a sua requisição.",
					};
				} else {
					retorno = {
						status: false,
						title: "ATENÇÃO!",
						message: error.message,
					};
				}
			});

		return retorno;
	},
	get: async function (rota, dados) {
		await conexao.convenios
			.get(
				rota,
				{ params: dados },
				{
					headers: { "Content-Type": "application/json" },
				}
			)
			.then((response) => {
				retorno = response;
			})
			.catch(function (error) {
				if (error.response) {
					// error.response.status = verificar o status do retorno;
					retorno = error.response;
				} else if (error.request) {
					retorno = {
						title: "ATENÇÃO!",
						message: "Não houve retorno do servidor para a sua requisição.",
					};
				} else {
					retorno = error.message;
				}
			});

		return retorno;
	},
};

const intranet = {
	post: async function (rota, dados, contentType = "application/json") {
		await conexao.intranet
			.post(rota, dados, {
				headers: { "Content-Type": contentType },
			})
			.then((response) => {
				retorno = response;
			})
			.catch(function (error) {
				if (error.response) {
					// error.response.status = verificar o status do retorno;
					retorno = error.response;
				} else if (error.request) {
					retorno = {
						status: false,
						title: "ATENÇÃO!",
						message: "Não houve retorno do servidor para a sua requisição.",
					};
				} else {
					retorno = {
						status: false,
						title: "ATENÇÃO!",
						message: error.message,
					};
				}
			});

		return retorno;
	},
	get: async function (rota, dados, contentType = "application/json") {
		await conexao.intranet
			.get(
				rota,
				{ params: dados },
				{
					headers: { "Content-Type": contentType },
				}
			)
			.then((response) => {
				retorno = response;
			})
			.catch(function (error) {
				if (error.response) {
					// error.response.status = verificar o status do retorno;
					retorno = error.response;
				} else if (error.request) {
					retorno = {
						title: "ATENÇÃO!",
						message: "Não houve retorno do servidor para a sua requisição.",
					};
				} else {
					retorno = error.message;
				}
			});

		return retorno;
	},
};

const api = { associados, geral, convenios, intranet };

export default api;
