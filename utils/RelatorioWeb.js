// utils/RelatorioWeb.js

export const gerarCSVWeb = (transacoes, saldo) => {
    const linhas = [
        ["ID", "Descrição", "Tipo", "Valor", "Data"],
        ...transacoes.map(t => [t.id, t.descricao, t.tipo, t.valor, t.data]),
        ["", "Saldo Atual", "", saldo, ""]
    ];

    const conteudo = linhas.map(l => l.join(",")).join("\n");
    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Salva referência em localStorage para permitir reset posterior
    localStorage.setItem("@relatorioCSV", url);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "relatorio_mymoney.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const gerarPDFWeb = (transacoes, saldo) => {
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

    const blob = new Blob([html], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Salva referência em localStorage para permitir reset posterior
    localStorage.setItem("@relatorioPDF", url);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "relatorio_mymoney.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Função para resetar relatórios no ambiente web
export const resetarRelatorioWeb = () => {
    localStorage.removeItem("@relatorioCSV");
    localStorage.removeItem("@relatorioPDF");
    alert("Relatórios exportados foram apagados com sucesso (Web)!");
};
