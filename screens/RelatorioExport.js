import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/* 📊 EXPORTAR CSV */
export async function exportarCSV(transacoes, saldo) {

    if (!transacoes || transacoes.length === 0) {
        alert('Nenhuma transação para exportar');
        return;
    }

    let csv = 'Descrição,Tipo,Valor,Data\n';

    transacoes.forEach(t => {
        csv += `${t.descricao},${t.tipo},${t.valor},${new Date(t.data).toLocaleDateString()}\n`;
    });

    csv += `\nSaldo Final,,${saldo},`;

    const fileUri = FileSystem.documentDirectory + 'relatorio_financeiro.csv';

    await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8
    });

    await Sharing.shareAsync(fileUri);
}
