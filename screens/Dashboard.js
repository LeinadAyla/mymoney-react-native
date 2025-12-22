import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Button,
    Platform,
    Alert,
    TextInput,
    Dimensions,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard({ navigation, onLogout }) {
    const [transacoes, setTransacoes] = useState([]);
    const [saldo, setSaldo] = useState(0);
    const [loading, setLoading] = useState(true);

    const [descricao, setDescricao] = useState('');
    const [tipo, setTipo] = useState('');
    const [valor, setValor] = useState('');
    const [usuario, setUsuario] = useState(null);

    const baseURL =
        Platform.OS === 'android'
            ? 'http://10.0.2.2:8080'
            : 'http://localhost:8080';

    useEffect(() => {
        carregarUsuario();
        carregarTransacoes();
    }, []);

    const carregarUsuario = async () => {
        try {
            const userData = await AsyncStorage.getItem('@usuario');
            if (userData) {
                setUsuario(JSON.parse(userData));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const formatarBRL = (valor) =>
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);

    const carregarTransacoes = async () => {
        try {
            const response = await fetch(`${baseURL}/api/transacoes`);
            if (!response.ok) throw new Error();

            const data = await response.json();
            setTransacoes(data);

            const saldoCalculado = data.reduce((acc, t) => {
                const v = Number(t.valor);
                return acc + (t.tipo === 'entrada' ? v : -v);
            }, 0);

            setSaldo(saldoCalculado);
        } catch {
            Alert.alert('Erro', 'Não foi possível carregar as transações.');
        } finally {
            setLoading(false);
        }
    };

    const salvarTransacao = async () => {
        const valorNum = parseFloat(String(valor).replace(',', '.'));

        if (!descricao.trim() || !tipo || isNaN(valorNum)) {
            Alert.alert('Campos inválidos');
            return;
        }

        try {
            const response = await fetch(`${baseURL}/api/transacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    descricao,
                    tipo,
                    valor: valorNum,
                    data: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error();

            setDescricao('');
            setTipo('');
            setValor('');
            carregarTransacoes();
        } catch {
            Alert.alert('Erro', 'Falha ao salvar transação.');
        }
    };

    const excluirTransacao = async (id) => {
        if (Platform.OS !== 'web') {
            return Alert.alert(
                'Excluir',
                'Deseja realmente excluir?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Excluir', style: 'destructive', onPress: () => excluirTransacao(id) }
                ]
            );
        }

        try {
            await fetch(`${baseURL}/api/transacoes/${id}`, { method: 'DELETE' });
            carregarTransacoes();
        } catch {
            Alert.alert('Erro ao excluir');
        }
    };

    const handleLogout = () => {
        const sair = () => {
            onLogout && onLogout();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            });
        };

        Platform.OS === 'web'
            ? window.confirm('Deseja sair?') && sair()
            : Alert.alert('Sair', 'Deseja sair?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: sair }
            ]);
    };

    /* 📊 Cálculos */
    const totalEntradas = transacoes
        .filter(t => t.tipo === 'entrada')
        .reduce((a, b) => a + Number(b.valor), 0);

    const totalSaidas = transacoes
        .filter(t => t.tipo === 'saida')
        .reduce((a, b) => a + Number(b.valor), 0);

    let saldoTemp = 0;
    const evolucaoSaldo = transacoes.map(t => {
        saldoTemp += t.tipo === 'entrada'
            ? Number(t.valor)
            : -Number(t.valor);
        return saldoTemp;
    });

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (o = 1) => `rgba(130, 10, 209, ${o})`,
        labelColor: () => '#333',
        strokeWidth: 2
    };

    const renderItem = ({ item }) => (
        <View style={styles.transacaoCard}>
            <View>
                <Text style={styles.transacaoDescricao}>{item.descricao}</Text>
                <Text style={styles.transacaoData}>
                    {new Date(item.data).toLocaleDateString()}
                </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
                <Text style={item.tipo === 'saida' ? styles.saida : styles.entrada}>
                    {formatarBRL(item.valor)}
                </Text>
                <Button
                    title="Excluir"
                    color="#e74c3c"
                    onPress={() => excluirTransacao(item.id)}
                />
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitulo}>MyMoney</Text>
                {usuario && <Text style={styles.headerUsuario}>Olá, {usuario.nome}</Text>}

                {/* 🔥 BOTÃO SAIR PROFISSIONAL */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Text style={styles.logoutButtonText}>🚪 Sair</Text>
                </TouchableOpacity>
            </View>

            {/* Saldo */}
            <View style={styles.cardSaldo}>
                <Text style={styles.saldoLabel}>Saldo disponível</Text>
                <Text style={styles.saldoValor}>{formatarBRL(saldo)}</Text>

                <View style={styles.resumoLinha}>
                    <Text style={styles.entrada}>⬆ {formatarBRL(totalEntradas)}</Text>
                    <Text style={styles.saida}>⬇ {formatarBRL(totalSaidas)}</Text>
                </View>
            </View>

            {/* Gráficos */}
            <View style={styles.card}>
                <Text style={styles.cardTitulo}>Entradas x Saídas</Text>
                <BarChart
                    data={{
                        labels: ['Entradas', 'Saídas'],
                        datasets: [{ data: [totalEntradas, totalSaidas] }]
                    }}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    fromZero
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitulo}>Evolução do Saldo</Text>
                <LineChart
                    data={{
                        labels: evolucaoSaldo.map((_, i) => `${i + 1}`),
                        datasets: [{ data: evolucaoSaldo }]
                    }}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                />
            </View>

            {/* Formulário */}
            <View style={styles.card}>
                <Text style={styles.cardTitulo}>Nova Transação</Text>

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

                <Picker selectedValue={tipo} onValueChange={setTipo}>
                    <Picker.Item label="Selecione o tipo" value="" />
                    <Picker.Item label="Entrada" value="entrada" />
                    <Picker.Item label="Saída" value="saida" />
                </Picker>

                <Button title="Salvar" onPress={salvarTransacao} />
            </View>

            {/* Lista */}
            <Text style={styles.listaTitulo}>Últimas movimentações</Text>

            {loading
                ? <Text style={styles.loading}>Carregando...</Text>
                : <FlatList
                    data={transacoes}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                />
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0f1f5',
        padding: 16
    },
    header: {
        backgroundColor: '#820ad1',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16
    },
    headerTitulo: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold'
    },
    headerUsuario: {
        color: '#fff',
        marginBottom: 8
    },
    logoutButton: {
        backgroundColor: '#000',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    cardSaldo: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16
    },
    saldoLabel: {
        color: '#666'
    },
    saldoValor: {
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 8
    },
    resumoLinha: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16
    },
    cardTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8
    },
    input: {
        backgroundColor: '#f2f2f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8
    },
    listaTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8
    },
    transacaoCard: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    transacaoDescricao: {
        fontWeight: 'bold'
    },
    transacaoData: {
        color: '#888',
        fontSize: 12
    },
    entrada: {
        color: '#2ecc71',
        fontWeight: 'bold'
    },
    saida: {
        color: '#e74c3c',
        fontWeight: 'bold'
    },
    loading: {
        textAlign: 'center',
        marginTop: 20
    }
});
