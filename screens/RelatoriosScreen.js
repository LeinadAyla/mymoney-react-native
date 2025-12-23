import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Button,
    Alert,
    Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart, PieChart } from 'react-native-chart-kit';

/* 📄 EXPORTAÇÕES */
import { exportarPDF, exportarCSV } from './Relatorio';

const screenWidth = Dimensions.get('window').width;

export default function RelatoriosScreen({ route }) {

    /* 🔥 RECEBE DADOS DO DASHBOARD */
    const { transacoes = [], saldo = 0 } = route.params || {};

    const [mes, setMes] = useState(new Date().getMonth());
    const [ano, setAno] = useState(new Date().getFullYear());
    const [filtradas, setFiltradas] = useState([]);

    useEffect(() => {
        filtrarTransacoes();
    }, [mes, ano, transacoes]);

    /* 📅 Filtro por mês/ano */
    const filtrarTransacoes = () => {
        const resultado = transacoes.filter(t => {
            const data = new Date(t.data);
            return data.getMonth() === mes && data.getFullYear() === ano;
        });
        setFiltradas(resultado);
    };

    /* 💰 Util */
    const formatarBRL = (valor) =>
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);

    /* 📊 Entradas x Saídas */
    const totalEntradas = filtradas
        .filter(t => t.tipo === 'entrada')
        .reduce((acc, t) => acc + Number(t.valor), 0);

    const totalSaidas = filtradas
        .filter(t => t.tipo === 'saida')
        .reduce((acc, t) => acc + Number(t.valor), 0);

    /* 🥧 Gastos por categoria */
    const gastosPorCategoria = {};
    filtradas
        .filter(t => t.tipo === 'saida')
        .forEach(t => {
            gastosPorCategoria[t.descricao] =
                (gastosPorCategoria[t.descricao] || 0) + Number(t.valor);
        });

    const pieData = Object.keys(gastosPorCategoria).map((key, index) => ({
        name: key,
        population: gastosPorCategoria[key],
        color: `hsl(${index * 60}, 70%, 50%)`,
        legendFontColor: '#333',
        legendFontSize: 12
    }));

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (o = 1) => `rgba(130, 10, 209, ${o})`,
        labelColor: () => '#333'
    };

    /* 📄 AÇÕES DE EXPORTAÇÃO (AJUSTADAS) */
    const handleExportarPDF = async () => {
        if (filtradas.length === 0) {
            Alert.alert('Relatório vazio', 'Não há dados para exportar.');
            return;
        }

        if (Platform.OS === 'web') {
            Alert.alert(
                'Exportação indisponível no Web',
                'Abra o app no celular ou emulador Android para exportar PDF.'
            );
            return;
        }

        await exportarPDF(filtradas, saldo);
    };

    const handleExportarCSV = async () => {
        if (filtradas.length === 0) {
            Alert.alert('Relatório vazio', 'Não há dados para exportar.');
            return;
        }

        if (Platform.OS === 'web') {
            Alert.alert(
                'Exportação indisponível no Web',
                'Abra o app no celular ou emulador Android para exportar CSV.'
            );
            return;
        }

        await exportarCSV(filtradas, saldo);
    };

    return (
        <ScrollView style={styles.container}>

            <Text style={styles.titulo}>📊 Relatórios Financeiros</Text>

            <Text style={styles.saldo}>
                Saldo atual: {formatarBRL(saldo)}
            </Text>

            {/* FILTROS */}
            <View style={styles.filtros}>
                <Picker selectedValue={mes} onValueChange={setMes}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Picker.Item
                            key={i}
                            label={new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                            value={i}
                        />
                    ))}
                </Picker>

                <Picker selectedValue={ano} onValueChange={setAno}>
                    {[2024, 2025, 2026].map(a => (
                        <Picker.Item key={a} label={String(a)} value={a} />
                    ))}
                </Picker>
            </View>

            {/* ENTRADAS X SAÍDAS */}
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

            {/* GASTOS POR CATEGORIA */}
            {pieData.length > 0 && (
                <>
                    <Text style={styles.cardTitulo}>Gastos por Categoria</Text>
                    <PieChart
                        data={pieData}
                        width={screenWidth - 32}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                    />
                </>
            )}

            {filtradas.length === 0 && (
                <Text style={styles.vazio}>
                    Nenhuma transação neste período.
                </Text>
            )}

            {/* EXPORTAÇÃO */}
            <View style={styles.botoes}>
                <Button title="📄 Exportar PDF" onPress={handleExportarPDF} />
                <Button title="📊 Exportar CSV" onPress={handleExportarCSV} />
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f0f1f5'
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8
    },
    saldo: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 16
    },
    filtros: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16
    },
    cardTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 12
    },
    botoes: {
        marginVertical: 20,
        gap: 10
    },
    vazio: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666'
    }
});
