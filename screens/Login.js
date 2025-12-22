import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation, onLogin }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    // 🔗 Base URL do backend (ajuste se necessário)
    const baseURL =
        Platform.OS === 'android'
            ? 'http://10.0.2.2:8080' // emulador Android
            : 'http://localhost:8080'; // web/iOS

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert("Erro", "Preencha todos os campos!");
            return;
        }

        try {
            const response = await fetch(`${baseURL}/api/usuarios/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            if (response.ok) {
                const usuario = await response.json();

                // 🔥 salva objeto completo no AsyncStorage
                await AsyncStorage.setItem('@usuario', JSON.stringify(usuario));

                // chama onLogin para atualizar estado global
                onLogin(usuario);

                Alert.alert("Sucesso", `Bem-vindo, ${usuario.nome}!`);
                navigation.replace('Dashboard'); // replace evita voltar para Login
            } else {
                const erro = await response.text();
                Alert.alert("Erro", erro || "Credenciais inválidas");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível conectar ao servidor.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>MyMoney - Login</Text>
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
            <Button title="Entrar" onPress={handleLogin} />
            <Button title="Criar Conta" onPress={() => navigation.navigate('Registro')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 6 }
});
