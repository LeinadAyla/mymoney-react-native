import { Platform, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Papa from 'papaparse';

// Importa RNFS apenas se não for web
let RNFS;
if (Platform.OS !== 'web') {
    RNFS = require('react-native-fs');
}

// Função para exportar PDF (mobile)
export const exportarPDF = async (transacoes, saldo) => {
    if (Platform.OS === 'web') {
        console.log("Exportação PDF nativa não suportada no web. Use gerarPDFWeb em utils/RelatorioWeb.js");
        return;
    }

    const html = `
        <html>
            <head>
                <meta charset="utf-8" />
                <style>
                    body { font-family: Arial; padding: 20px; }
                    h1 { color: #2e86de; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .entrada { color: #27ae60; font-weight: bold; }
                    .saida { color: #c0392b; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Relatório MyMoney</h1>
                <p><strong>Saldo Atual:</strong> R$ ${saldo.toFixed(2)}</p>
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Descrição</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Data</th>
                    </tr>
                    ${transacoes.map(t => `
                        <tr>
                            <td>${t.id}</td>
                            <td>${t.descricao}</td>
                            <td>${t.tipo}</td>
                            <td class="${t.tipo === 'saida' ? 'saida' : 'entrada'}">
                                R$ ${Number(t.valor).toFixed(2)}
                            </td>
                            <td>${new Date(t.data).toLocaleString('pt-BR')}</td>
                        </tr>
                    `).join('')}
                </table>
            </body>
        </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
};

// Função para exportar CSV (mobile)
export const exportarCSV = async (transacoes, saldo) => {
    if (Platform.OS === 'web') {
        console.log("Exportação CSV nativa não suportada no web. Use gerarCSVWeb em utils/RelatorioWeb.js");
        return;
    }

    const dados = [
        ["ID", "Descrição", "Tipo", "Valor", "Data"],
        ...transacoes.map(t => [t.id, t.descricao, t.tipo, t.valor, t.data]),
        ["", "Saldo Atual", "", saldo, ""]
    ];

    const csv = Papa.unparse(dados);

    const path = RNFS.DocumentDirectoryPath + '/relatorio.csv';
    await RNFS.writeFile(path, csv, 'utf8');

    await Sharing.shareAsync('file://' + path);
};

// Função para resetar relatórios exportados
export const resetarRelatorio = async () => {
    if (Platform.OS === 'web') {
        Alert.alert("Resetar Relatório", "No web não há arquivos locais para limpar.");
        return;
    }

    try {
        const pdfPath = RNFS.DocumentDirectoryPath + '/relatorio.pdf';
        const csvPath = RNFS.DocumentDirectoryPath + '/relatorio.csv';

        // Remove arquivos se existirem
        const pdfExists = await RNFS.exists(pdfPath);
        if (pdfExists) await RNFS.unlink(pdfPath);

        const csvExists = await RNFS.exists(csvPath);
        if (csvExists) await RNFS.unlink(csvPath);

        Alert.alert("Resetar Relatório", "Relatórios exportados foram apagados com sucesso!");
    } catch (error) {
        console.log("Erro ao resetar relatórios:", error);
        Alert.alert("Erro", "Não foi possível limpar os relatórios.");
    }
};
