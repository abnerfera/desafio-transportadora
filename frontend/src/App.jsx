import { useState, useEffect } from 'react';
import api from './services/api';

function App() {
  // Guarda a lista de coletas
  const [coletas, setColetas] = useState([]);

  // Guardam o que o usuário digita no formulário
  const [remetente, setRemetente] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [prioridade, setPrioridade] = useState(0);
  const [observacao, setObservacao] = useState('');

  // Tiramos a função de dentro do useEffect para podermos chamá-la de novo sempre que criarmos uma coleta
  const carregarColetas = async () => {
    try {
      const resposta = await api.get('/coleta');
      setColetas(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar as coletas:", erro);
    }
  };

  useEffect(() => {
    carregarColetas();
  }, []);

  // Função disparada quando clicamos no botão "Registrar Coleta"
  const handleCriarColeta = async (e) => {
    e.preventDefault(); // Evita que a página recarregue ao enviar o formulário

    try {
      // Manda o pacote de dados para o C#
      await api.post('/coleta', {
        remetente,
        destinatario,
        dataPrevista: new Date().toISOString(), // Por enquanto, envia a data de hoje
        prioridade: parseInt(prioridade),
        observacao
      });

      alert('Coleta registrada com sucesso!');

      // Limpa os campos da tela
      setRemetente('');
      setDestinatario('');
      setPrioridade(0);
      setObservacao('');

      // Recarrega a tabela para mostrar a coleta nova instantaneamente!
      carregarColetas();
    } catch (erro) {
      console.error(erro);
      alert('Erro ao registrar a coleta.');
    }
  };

  const handleAtribuir = async (id) => {
    // Para simplificar a interface agora, usamos um prompt nativo do navegador
    const motoristaId = prompt("Digite o ID do Motorista (temos o 1 e o 2 no banco):");
    const veiculoId = prompt("Digite o ID do Veículo (temos o 1 e o 2 no banco):");

    if (motoristaId && veiculoId) {
      try {
        await api.patch(`/coleta/${id}/atribuir`, {
          motoristaId: parseInt(motoristaId),
          veiculoId: parseInt(veiculoId)
        });
        alert("Motorista e veículo atribuídos com sucesso!");
        carregarColetas(); // Atualiza a tabela
      } catch (erro) {
        // Mostra a mensagem de erro que vem lá do nosso Back-end (regras de negócio)
        alert(erro.response?.data || "Erro ao atribuir.");
      }
    }
  };

  const handleFinalizar = async (id) => {
    if (window.confirm("Confirmar que esta carga foi coletada?")) {
      try {
        await api.patch(`/coleta/${id}/finalizar`);
        alert("Coleta finalizada com sucesso!");
        carregarColetas();
      } catch (erro) {
        alert(erro.response?.data || "Erro ao finalizar.");
      }
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm("Tem certeza que deseja CANCELAR esta coleta?")) {
      try {
        await api.patch(`/coleta/${id}/cancelar`);
        alert("Coleta cancelada.");
        carregarColetas();
      } catch (erro) {
        alert(erro.response?.data || "Erro ao cancelar.");
      }
    }
  };

  const traduzirStatus = (status) => {
    switch (status) {
      case 0: return 'Aberta';
      case 1: return 'Atribuída';
      case 2: return 'Coletada';
      case 3: return 'Cancelada';
      default: return 'Desconhecido';
    }
  };

  const traduzirPrioridade = (prioridade) => {
    return prioridade === 1 ? 'Alta' : 'Normal';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1> Painel de Operações - Transportadora</h1>
      
      {/* --- INÍCIO DO FORMULÁRIO --- */}
      <div style={{ backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>Nova Solicitação</h2>
        <form onSubmit={handleCriarColeta} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          
          <input 
            type="text" 
            placeholder="Nome do Remetente" 
            required
            value={remetente}
            onChange={(e) => setRemetente(e.target.value)}
            style={{ padding: '8px', flex: '1', minWidth: '200px' }}
          />

          <input 
            type="text" 
            placeholder="Nome do Destinatário" 
            required
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            style={{ padding: '8px', flex: '1', minWidth: '200px' }}
          />

          <select 
            value={prioridade} 
            onChange={(e) => setPrioridade(e.target.value)}
            style={{ padding: '8px' }}
          >
            <option value={0}>Prioridade: Normal</option>
            <option value={1}>Prioridade: Alta</option>
          </select>

          <textarea 
            placeholder="Observações (opcional)" 
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            rows="3"
            style={{ padding: '8px', flex: '100%', minWidth: '200px', resize: 'vertical', fontFamily: 'inherit' }}
          />

          <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Registrar Coleta
          </button>
        </form>
      </div>
      {/* --- FIM DO FORMULÁRIO --- */}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#eee', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>ID</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Remetente</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Destinatário</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Prioridade</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Status</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {coletas.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>Nenhuma coleta encontrada...</td>
            </tr>
          ) : (
            coletas.map((coleta) => (
              <tr key={coleta.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{coleta.id}</td>
                <td style={{ padding: '10px' }}>{coleta.remetente}</td>
                <td style={{ padding: '10px' }}>{coleta.destinatario}</td>
                {/* Aqui nós destacamos visualmente se a prioridade for Alta */}
                <td style={{ padding: '10px', color: coleta.prioridade === 1 ? 'red' : 'black', fontWeight: coleta.prioridade === 1 ? 'bold' : 'normal' }}>
                  {traduzirPrioridade(coleta.prioridade)}
                </td>
                <td style={{ padding: '10px' }}>
                  <strong>{traduzirStatus(coleta.status)}</strong>
                </td>
                <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                  {/* Só mostra o botão Atribuir se o status for 0 (Aberta) */}
                  {coleta.status === 0 && (
                    <button onClick={() => handleAtribuir(coleta.id)} style={{ padding: '5px', backgroundColor: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                      Atribuir
                    </button>
                  )}
                  
                  {/* Só mostra o botão Finalizar se o status for 1 (Atribuída) */}
                  {coleta.status === 1 && (
                    <button onClick={() => handleFinalizar(coleta.id)} style={{ padding: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                      Finalizar
                    </button>
                  )}

                  {/* Pode cancelar a qualquer momento, exceto se já estiver Coletada (2) ou Cancelada (3) */}
                  {coleta.status !== 2 && coleta.status !== 3 && (
                    <button onClick={() => handleCancelar(coleta.id)} style={{ padding: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;