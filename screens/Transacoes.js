import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform } from 'react-native';

export default function Transacoes({ navigation }) {
    const [transacoes, setTransacoes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const url =
            Platform.OS === 'android'
                ? 'http://10.0.2.2:8080/api/transacoes' // emulador Android
                : 'http://localhost:8080/api/transacoes'; // iOS ou web

        fetch(url)
            .then(response => response.json())
            .then(data => {
                setTransacoes(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Erro ao buscar transações:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loading}>Carregando...</Text>
            </View>
        );
    }

    const formatarBRL = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(valor);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Minhas Transações</Text>
            <FlatList
                data={transacoes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Detalhes', { transacao: item })}
                    >
                        <View style={styles.card}>
                            <Text style={styles.descricao}>{item.descricao}</Text>
                            <Text style={styles.tipo}>
                                {item.tipo === 'entrada' ? '⬆️ Entrada' : '⬇️ Saída'}
                            </Text>
                            <Text
                                style={[
                                    styles.valor,
                                    item.tipo === 'saida' ? styles.saida : styles.entrada
                                ]}
                            >
                                {formatarBRL(item.valor)}
                            </Text>
                            <Text style={styles.data}>
                                {new Date(item.data).toLocaleDateString('pt-BR')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#2e86de',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    descricao: {
        fontSize: 18,
        fontWeight: '600',
    },
    tipo: {
        fontSize: 14,
        color: '#666',
    },
    valor: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    entrada: {
        color: '#27ae60',
    },
    saida: {
        color: '#c0392b',
    },
    data: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
    loading: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
});
