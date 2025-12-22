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

const Stack = createNativeStackNavigator();
const TASK_NAME = "exportarRelatorioMensal";

const storage = Platform.OS === 'web'
    ? {
        getItem: async (key) => Promise.resolve(localStorage.getItem(key)),
        setItem: async (key, value) => Promise.resolve(localStorage.setItem(key, value)),
        removeItem: async (key) => Promise.resolve(localStorage.removeItem(key)),
    }
    : AsyncStorageNative;

export default function App() {
    const transacoesMock = [
        { id: "1", descricao: "Salário", tipo: "entrada", valor: 3500 },
        { id: "2", descricao: "Supermercado", tipo: "saida", valor: -250 },
        { id: "3", descricao: "Transporte", tipo: "saida", valor: -120 }
    ];

    const [transacoes, setTransacoes] = useState(transacoesMock);
    const [saldo, setSaldo] = useState(
        transacoesMock.reduce((acc, t) => acc + t.valor, 0)
    );

    // 🔥 Estado de autenticação
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const carregarTransacoes = async () => {
            try {
                const dadosSalvos = await storage.getItem('@transacoes');
                if (dadosSalvos) {
                    const lista = JSON.parse(dadosSalvos);
                    setTransacoes(lista);
                    setSaldo(lista.reduce((acc, t) => acc + t.valor, 0));
                }
            } catch (error) {
                console.log('Erro ao carregar transações:', error);
            }
        };
        carregarTransacoes();

        // 🔥 Verifica se usuário já está logado
        const verificarLogin = async () => {
            try {
                const userData = await storage.getItem('@usuario');
                if (userData) {
                    setUsuario(JSON.parse(userData));
                }
            } catch (error) {
                console.log('Erro ao verificar login:', error);
            }
        };
        verificarLogin();
    }, []);

    useEffect(() => {
        const salvarTransacoes = async () => {
            try {
                await storage.setItem('@transacoes', JSON.stringify(transacoes));
                setSaldo(transacoes.reduce((acc, t) => acc + t.valor, 0));
            } catch (error) {
                console.log('Erro ao salvar transações:', error);
            }
        };
        salvarTransacoes();
    }, [transacoes]);

    const addTransacao = (novaTransacao) => {
        setTransacoes(prev => {
            const lista = [
                ...prev,
                { id: String(prev.length + 1), ...novaTransacao }
            ];
            setSaldo(lista.reduce((acc, t) => acc + t.valor, 0));
            return lista;
        });
    };

    const updateTransacao = (id, transacaoAtualizada) => {
        setTransacoes(prev => {
            const lista = prev.map(t => t.id === id ? { ...t, ...transacaoAtualizada } : t);
            setSaldo(lista.reduce((acc, t) => acc + t.valor, 0));
            return lista;
        });
    };

    const deleteTransacao = (id) => {
        setTransacoes(prev => {
            const lista = prev.filter(t => t.id !== id);
            setSaldo(lista.reduce((acc, t) => acc + t.valor, 0));
            return lista;
        });
    };

    // 🔥 Funções de login/logout reais
    const handleLogin = async (userObj) => {
        await storage.setItem('@usuario', JSON.stringify(userObj));
        setUsuario(userObj);
    };

    const handleLogout = async () => {
        await storage.removeItem('@usuario');
        setUsuario(null);
    };

    useEffect(() => {
        if (Platform.OS !== 'web') {
            const registrarTarefa = async () => {
                try {
                    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
                        minimumInterval: 60 * 60 * 24,
                        stopOnTerminate: false,
                        startOnBoot: true,
                    });
                } catch (error) {
                    console.log("Erro ao registrar tarefa:", error);
                }
            };
            registrarTarefa();
        }
    }, []);

    useEffect(() => {
        if (Platform.OS === 'android') {
            const backAction = () => {
                Alert.alert(
                    "Sair do App",
                    "Tem certeza que deseja sair do MyMoney?",
                    [
                        { text: "Cancelar", style: "cancel", onPress: () => null },
                        { text: "Sim", onPress: () => BackHandler.exitApp() }
                    ]
                );
                return true;
            };

            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => backHandler.remove();
        }
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={usuario ? "Dashboard" : "Login"}>
                <Stack.Screen name="Login" options={{ title: 'Login' }}>
                    {props => (
                        <Login
                            {...props}
                            onLogin={handleLogin}
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen name="Registro" component={Registro} options={{ title: 'Criar Conta' }} />
                <Stack.Screen name="Dashboard" options={{ title: 'MyMoney Dashboard' }}>
                    {props => (
                        <Dashboard
                            {...props}
                            usuario={usuario}
                            transacoes={transacoes}
                            saldo={saldo}
                            setTransacoes={setTransacoes}
                            setSaldo={setSaldo}
                            onLogout={handleLogout}
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen name="Cadastro" options={{ title: 'Cadastrar Transação' }}>
                    {props => (
                        <Cadastro
                            {...props}
                            addTransacao={addTransacao}
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen name="Detalhes" options={{ title: 'Detalhes da Transação' }}>
                    {props => (
                        <Detalhes
                            {...props}
                            updateTransacao={updateTransacao}
                            deleteTransacao={deleteTransacao}
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen name="Editar" options={{ title: 'Editar Transação' }}>
                    {props => (
                        <Editar
                            {...props}
                            updateTransacao={updateTransacao}
                        />
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

if (Platform.OS !== 'web') {
    TaskManager.defineTask(TASK_NAME, async () => {
        try {
            const dadosSalvos = await AsyncStorageNative.getItem('@transacoes');
            if (dadosSalvos) {
                const transacoes = JSON.parse(dadosSalvos);
                const saldo = transacoes.reduce((acc, t) => acc + t.valor, 0);
                console.log("Relatório mensal exportado automaticamente (mobile). Saldo:", saldo);
                return BackgroundFetch.Result.NewData;
            }
            return BackgroundFetch.Result.NoData;
        } catch (error) {
            console.log("Erro na exportação automática:", error);
            return BackgroundFetch.Result.Failed;
        }
    });
}
