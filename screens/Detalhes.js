import React from 'react';
import { StyleSheet, Text, View, Button, Alert, Platform } from 'react-native';

export default function Detalhes({ route, navigation }) {
    const { transacao } = route.params;

    const formatarBRL = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(valor);
    };

    const confirmarExclusao = () => {
        Alert.alert(
            "Excluir Transação",
            "Tem certeza que deseja excluir esta transação?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const url =
                                Platform.OS === 'android'
                                    ? `http://10.0.2.2:8080/api/transacoes/${transacao.id}`
                                    : `http://localhost:8080/api/transacoes/${transacao.id}`;

                            const response = await fetch(url, {
                                method: 'DELETE',
                            });

                            if (response.ok) {
                                Alert.alert("Sucesso", "Transação excluída com sucesso!");
                                navigation.goBack();
                            } else {
                                Alert.alert("Erro", "Não foi possível excluir a transação.");
                            }
                        } catch (error) {
                            console.error("Erro ao excluir transação:", error);
                            Alert.alert("Erro", "Falha na comunicação com o servidor.");
                        }
                    }
                }
            ]
        );
    };

    const confirmarReset = () => {
        Alert.alert(
            "Resetar Transação",
            "Deseja resetar esta transação para os valores padrão?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Resetar",
                    onPress: async () => {
                        const transacaoResetada = {
                            descricao: "Transação Resetada",
                            tipo: "entrada",
                            valor: 0,
                            data: new Date().toISOString()
                        };

                        try {
                            const url =
                                Platform.OS === 'android'
                                    ? `http://10.0.2.2:8080/api/transacoes/${transacao.id}`
                                    : `http://localhost:8080/api/transacoes/${transacao.id}`;

                            const response = await fetch(url, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(transacaoResetada),
                            });

                            if (response.ok) {
                                Alert.alert("Sucesso", "Transação resetada com sucesso!");
                                navigation.goBack();
                            } else {
                                Alert.alert("Erro", "Não foi possível resetar a transação.");
                            }
                        } catch (error) {
                            console.error("Erro ao resetar transação:", error);
                            Alert.alert("Erro", "Falha na comunicação com o servidor.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Detalhes da Transação</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Descrição:</Text>
                <Text style={styles.valor}>{transacao.descricao}</Text>

                <Text style={styles.label}>Tipo:</Text>
                <Text style={styles.valor}>
                    {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                </Text>

                <Text style={styles.label}>Valor:</Text>
                <Text
                    style={[
                        styles.valor,
                        transacao.tipo === 'saida' ? styles.saida : styles.entrada
                    ]}
                >
                    {formatarBRL(transacao.valor)}
                </Text>
            </View>

            <View style={styles.botoes}>
                <Button
                    title="Editar"
                    onPress={() => navigation.navigate('Editar', { transacao })}
                />
                <Button
                    title="Excluir"
                    color="#c0392b"
                    onPress={confirmarExclusao}
                />
                <Button
                    title="Resetar"
                    color="#f39c12"
                    onPress={confirmarReset}
                />
            </View>

            <View style={styles.voltar}>
                <Button
                    title="Voltar ao Dashboard"
                    color="#2e86de"
                    onPress={() => navigation.navigate('Dashboard')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    titulo: { fontSize: 24, fontWeight: 'bold', color: '#2e86de', marginBottom: 24, textAlign: 'center' },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 24
    },
    label: { fontSize: 18, fontWeight: 'bold', marginTop: 12, color: '#333' },
    valor: { fontSize: 18, marginTop: 4, color: '#333' },
    entrada: { color: '#27ae60', fontWeight: 'bold' },
    saida: { color: '#c0392b', fontWeight: 'bold' },
    botoes: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
    voltar: { marginTop: 10, alignItems: 'center' }
});
