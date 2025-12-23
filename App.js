import React, { useState, useEffect } from 'react';
import { Platform, BackHandler, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AsyncStorageNative from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

import Login from './screens/Login';
import Registro from './screens/Registro';
import Dashboard from './screens/Dashboard';
import Cadastro from './screens/Cadastro';
import Detalhes from './screens/Detalhes';
import Editar from './screens/Editar';
import RelatoriosScreen from './screens/RelatoriosScreen';

const Stack = createNativeStackNavigator();
const TASK_NAME = "exportarRelatorioMensal";

/* 🔐 Storage compatível Web / Mobile */
const storage = Platform.OS === 'web'
    ? {
        getItem: async (key) => Promise.resolve(localStorage.getItem(key)),
        setItem: async (key, value) => Promise.resolve(localStorage.setItem(key, value)),
        removeItem: async (key) => Promise.resolve(localStorage.removeItem(key)),
    }
    : AsyncStorageNative;

export default function App() {

    /* 📊 Estado principal */
    const [transacoes, setTransacoes] = useState([]);
    const [saldo, setSaldo] = useState(0);

    /* 🔥 Autenticação */
    const [usuario, setUsuario] = useState(null);

    /* 📥 Carregar dados salvos */
    useEffect(() => {
        const carregarDados = async () => {
            try {
                const dados = await storage.getItem('@transacoes');
                const user = await storage.getItem('@usuario');

                if (dados) {
                    const lista = JSON.parse(dados);
                    setTransacoes(lista);
                    setSaldo(lista.reduce((acc, t) => acc + Number(t.valor), 0));
                }

                if (user) {
                    setUsuario(JSON.parse(user));
                }
            } catch (error) {
                console.log('Erro ao carregar dados:', error);
            }
        };
        carregarDados();
    }, []);

    /* 💾 Persistir transações */
    useEffect(() => {
        const salvar = async () => {
            try {
                await storage.setItem('@transacoes', JSON.stringify(transacoes));
                setSaldo(transacoes.reduce((acc, t) => acc + Number(t.valor), 0));
            } catch (error) {
                console.log('Erro ao salvar transações:', error);
            }
        };
        salvar();
    }, [transacoes]);

    /* ➕ CRUD */
    const addTransacao = (nova) => {
        setTransacoes(prev => [...prev, { id: Date.now().toString(), ...nova }]);
    };

    const updateTransacao = (id, dados) => {
        setTransacoes(prev =>
            prev.map(t => t.id === id ? { ...t, ...dados } : t)
        );
    };

    const deleteTransacao = (id) => {
        setTransacoes(prev => prev.filter(t => t.id !== id));
    };

    /* 🔐 Login */
    const handleLogin = async (user) => {
        await storage.setItem('@usuario', JSON.stringify(user));
        setUsuario(user);
    };

    const handleLogout = async () => {
        await storage.removeItem('@usuario');
        setUsuario(null);
    };

    /* ⏱️ Tarefa em background (mobile) */
    useEffect(() => {
        if (Platform.OS !== 'web') {
            BackgroundFetch.registerTaskAsync(TASK_NAME, {
                minimumInterval: 60 * 60 * 24,
                stopOnTerminate: false,
                startOnBoot: true,
            }).catch(console.log);
        }
    }, []);

    /* 🔙 Botão físico Android */
    useEffect(() => {
        if (Platform.OS === 'android') {
            const backAction = () => {
                Alert.alert("Sair do App", "Deseja sair do MyMoney?", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Sim", onPress: () => BackHandler.exitApp() }
                ]);
                return true;
            };
            const handler = BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => handler.remove();
        }
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={usuario ? "Dashboard" : "Login"}>

                <Stack.Screen name="Login" options={{ title: 'Login' }}>
                    {props => <Login {...props} onLogin={handleLogin} />}
                </Stack.Screen>

                <Stack.Screen name="Registro" component={Registro} />

                <Stack.Screen name="Dashboard" options={{ title: 'MyMoney' }}>
                    {props => (
                        <Dashboard
                            {...props}
                            usuario={usuario}
                            transacoes={transacoes}
                            saldo={saldo}
                            onLogout={handleLogout}
                        />
                    )}
                </Stack.Screen>

                <Stack.Screen name="Cadastro">
                    {props => <Cadastro {...props} addTransacao={addTransacao} />}
                </Stack.Screen>

                <Stack.Screen name="Detalhes">
                    {props => (
                        <Detalhes
                            {...props}
                            updateTransacao={updateTransacao}
                            deleteTransacao={deleteTransacao}
                        />
                    )}
                </Stack.Screen>

                <Stack.Screen name="Editar">
                    {props => <Editar {...props} updateTransacao={updateTransacao} />}
                </Stack.Screen>

                {/* 📊 NOVA TELA DE RELATÓRIOS */}
                <Stack.Screen
                    name="Relatorios"
                    component={RelatoriosScreen}
                    options={{ title: 'Relatórios Financeiros' }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
}

/* 📦 Background Task */
if (Platform.OS !== 'web') {
    TaskManager.defineTask(TASK_NAME, async () => {
        try {
            return BackgroundFetch.Result.NewData;
        } catch {
            return BackgroundFetch.Result.Failed;
        }
    });
}
