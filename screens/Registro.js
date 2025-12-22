import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';

export default function Registro({ navigation }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    // 🔗 Base URL do backend (ajuste se necessário)
    const baseURL =
        Platform.OS === 'android'
            ? 'http://10.0.2.2:8080' // emulador Android
            : 'http://localhost:8080'; // web/iOS

    const handleRegistro = async () => {
        if (!nome || !email || !senha) {
            Alert.alert("Erro", "Preencha todos os campos!");
            return;
        }

        try {
            const response = await fetch(`${baseURL}/api/usuarios/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });

            if (response.ok) {
                const usuario = await response.json();
                Alert.alert("Sucesso", `Conta criada para ${usuario.nome}!`);
                navigation.navigate('Login'); // volta para tela de login
            } else {
                const erro = await response.text();
                Alert.alert("Erro", erro || "Não foi possível criar a conta.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível conectar ao servidor.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Criar Conta - MyMoney</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
            />
            <Button title="Registrar" onPress={handleRegistro} />
            <Button title="Voltar ao Login" onPress={() => navigation.navigate('Login')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 6 }
});
