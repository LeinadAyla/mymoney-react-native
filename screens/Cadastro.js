import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function Cadastro({ navigation }) {
    const [descricao, setDescricao] = useState("");
    const [tipo, setTipo] = useState(""); // "entrada" ou "saida"
    const [valor, setValor] = useState("");

    const salvarTransacao = () => {
        const valorNumerico = parseFloat(String(valor).replace(',', '.').trim());

        if (!descricao.trim() || isNaN(valorNumerico) || !tipo) {
            Alert.alert('Campos inválidos', 'Preencha descrição, tipo e valor numérico.');
            return;
        }

        if (tipo === 'entrada' && valorNumerico < 0) {
            Alert.alert('Valor inválido', 'Entradas não podem ter valores negativos.');
            return;
        }

        const novaTransacao = {
            descricao: descricao.trim(),
            tipo,
            valor: valorNumerico,
            data: new Date().toISOString() // adiciona data atual
        };

        Alert.alert(
            "Confirmar Cadastro",
            `Salvar transação: ${descricao} - ${tipo} - R$ ${valorNumerico}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Salvar",
                    onPress: async () => {
                        try {
                            const url =
                                Platform.OS === 'android'
                                    ? 'http://10.0.2.2:8080/api/transacoes'
                                    : 'http://localhost:8080/api/transacoes';

                            const response = await fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(novaTransacao),
                            });

                            if (response.ok) {
                                const data = await response.json();
                                console.log("Transação salva:", data);
                                Alert.alert("Sucesso", "Transação cadastrada com sucesso!");
                                navigation.goBack();
                            } else {
                                Alert.alert("Erro", "Não foi possível salvar a transação.");
                            }
                        } catch (error) {
                            console.error("Erro ao salvar transação:", error);
                            Alert.alert("Erro", "Falha na comunicação com o servidor.");
                        }
                    }
                }
            ]
        );
    };

    const cancelarCadastro = () => {
        navigation.navigate('Dashboard');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Cadastrar Transação</Text>

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
                    <Picker.Item label="Selecione o tipo" value="" />
                    <Picker.Item label="Entrada" value="entrada" />
                    <Picker.Item label="Saída" value="saida" />
                </Picker>
            </View>

            <View style={styles.botoes}>
                <Button title="Salvar" onPress={salvarTransacao} />
                <Button title="Cancelar Cadastro" color="#c0392b" onPress={cancelarCadastro} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    titulo: { fontSize: 24, fontWeight: 'bold', color: '#2e86de', marginBottom: 16, textAlign: 'center' },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 6,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ccc'
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
