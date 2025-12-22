import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function Editar({ route, navigation }) {
    const { transacao } = route.params;

    // Preenche automaticamente com os dados da transação selecionada
    const [descricao, setDescricao] = useState(transacao.descricao);
    const [valor, setValor] = useState(String(Math.abs(transacao.valor)));
    const [tipo, setTipo] = useState(transacao.tipo); // "entrada" ou "saida"

    const salvarEdicao = () => {
        const valorNumerico = parseFloat(String(valor).replace(',', '.').trim());

        if (!descricao.trim() || isNaN(valorNumerico) || !tipo) {
            Alert.alert('Campos inválidos', 'Preencha descrição, tipo e valor numérico.');
            return;
        }

        if (tipo === 'entrada' && valorNumerico < 0) {
            Alert.alert('Valor inválido', 'Entradas não podem ter valores negativos.');
            return;
        }

        const transacaoAtualizada = {
            descricao: descricao.trim(),
            tipo,
            valor: valorNumerico,
            data: new Date().toISOString()
        };

        Alert.alert(
            "Confirmar Alterações",
            "Tem certeza que deseja salvar estas alterações?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Salvar",
                    onPress: async () => {
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
                                body: JSON.stringify(transacaoAtualizada),
                            });

                            if (response.ok) {
                                const data = await response.json();
                                console.log("Transação atualizada:", data);
                                Alert.alert("Sucesso", "Transação atualizada com sucesso!");
                                navigation.goBack();
                            } else {
                                Alert.alert("Erro", "Não foi possível atualizar a transação.");
                            }
                        } catch (error) {
                            console.error("Erro ao atualizar transação:", error);
                            Alert.alert("Erro", "Falha na comunicação com o servidor.");
                        }
                    }
                }
            ]
        );
    };

    const resetarTransacao = () => {
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
                                const data = await response.json();
                                console.log("Transação resetada:", data);
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

    const cancelarEdicao = () => {
        navigation.navigate('Dashboard');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Editar Transação</Text>
            <TextInput
                style={styles.input}
                placeholder="Descrição"
                value={descricao}
                onChangeText={setDescricao}
            />
            <TextInput
                style={styles.input}
                placeholder="Valor"
                keyboardType="numeric"
                value={valor}
                onChangeText={setValor}
            />
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={tipo}
                    onValueChange={(itemValue) => setTipo(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Entrada" value="entrada" />
                    <Picker.Item label="Saída" value="saida" />
                </Picker>
            </View>
            <View style={styles.botoes}>
                <Button title="Salvar Alterações" onPress={salvarEdicao} />
                <Button title="Resetar" color="#f39c12" onPress={resetarTransacao} />
                <Button title="Cancelar Edição" color="#c0392b" onPress={cancelarEdicao} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    titulo: { fontSize: 24, fontWeight: 'bold', color: '#2e86de', marginBottom: 24, textAlign: 'center' },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        backgroundColor: '#fff'
    },
    pickerContainer: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff'
    },
    picker: { height: 50, width: '100%' },
    botoes: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }
});
