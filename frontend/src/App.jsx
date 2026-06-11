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

  // ESTADOS DOS FILTROS
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

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
    e.preventDefault(); 

    try {
      // Manda o pacote de dados para o C#
      await api.post('/coleta', {
        remetente,
        destinatario,
        dataPrevista: new Date().toISOString(), 
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
    // Para simplificar a interface
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

  const handleOcorrencia = async (id) => {
    const descricao = prompt("Descreva o que aconteceu (Ex: Cliente ausente, Endereço não localizado):");
    
    if (!descricao) return; 

    const usuarioResponsavel = prompt("Digite o seu nome (Usuário responsável pelo registro):");
    
    if (!usuarioResponsavel) return;

    try {
      await api.post(`/coleta/${id}/ocorrencia`, {
        descricao: descricao,
        usuarioResponsavel: usuarioResponsavel
      });
      alert("Ocorrência registrada com sucesso!");
      carregarColetas(); 
    } catch (erro) {
      alert("Erro ao registrar a ocorrência.");
    }
  };

  // LÓGICA DE FILTRAGEM 
  // A variável 'coletasFiltradas' vai passar uma peneira na nossa lista original
  const coletasFiltradas = coletas.filter((coleta) => {
    // 1. Filtro de Status (Se estiver vazio, passa tudo)
    const matchStatus = filtroStatus === '' || coleta.status.toString() === filtroStatus;
    
    // 2. Filtro de Cliente/Remetente (Ignora maiúsculas e minúsculas)
    const matchCliente = filtroCliente === '' || coleta.remetente.toLowerCase().includes(filtroCliente.toLowerCase());
    
    // 3. Filtro de Período
    let matchData = true;
    if (filtroDataInicio || filtroDataFim) {
      // Pega só a parte da data (YYYY-MM-DD) cortando as horas
      const dataColeta = coleta.dataPrevista ? coleta.dataPrevista.split('T')[0] : '';
      if (filtroDataInicio && dataColeta < filtroDataInicio) matchData = false;
      if (filtroDataFim && dataColeta > filtroDataFim) matchData = false;
    }

    return matchStatus && matchCliente && matchData;
  });
  
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

  const verHistorico = (coleta) => {
    // Verifica se existem ocorrências
    if (!coleta.ocorrencias || coleta.ocorrencias.length === 0) {
      alert("Nenhuma ocorrência registrada para esta coleta.");
      return;
    }

    // Formata o texto para cada ocorrência encontrada
    const historicoFormatado = coleta.ocorrencias.map(o => 
      ` Data: ${new Date(o.dataHora).toLocaleString()}\n Responsável: ${o.usuarioResponsavel}\n Descrição: ${o.descricao}`
    ).join('\n\n-------------------\n\n');

    alert(`Histórico de Ocorrências (Coleta ${coleta.id}):\n\n${historicoFormatado}`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1> Painel de Operações - Transportadora</h1>
      
      {/*INÍCIO DO FORMULÁRIO*/}
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
      {/* FIM DO FORMULÁRIO */}

      {/* INÍCIO DA BARRA DE FILTROS */}
      <div style={{ backgroundColor: '#e2e8f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <strong style={{ minWidth: '60px' }}>Filtros:</strong>
        
        <input 
          type="text" 
          placeholder="Buscar por Cliente (Remetente)" 
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          style={{ padding: '6px', flex: '1', minWidth: '180px' }}
        />

        <select 
          value={filtroStatus} 
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={{ padding: '6px', minWidth: '150px' }}
        >
          <option value="">Todas as Situações</option>
          <option value="0">Aberta</option>
          <option value="1">Atribuída</option>
          <option value="2">Coletada</option>
          <option value="3">Cancelada</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>De:</label>
          <input 
            type="date" 
            value={filtroDataInicio}
            onChange={(e) => setFiltroDataInicio(e.target.value)}
            style={{ padding: '6px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Até:</label>
          <input 
            type="date" 
            value={filtroDataFim}
            onChange={(e) => setFiltroDataFim(e.target.value)}
            style={{ padding: '6px' }}
          />
        </div>
        
        {/* Botão para limpar os filtros */}
        <button 
          onClick={() => { setFiltroStatus(''); setFiltroCliente(''); setFiltroDataInicio(''); setFiltroDataFim(''); }} 
          style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Limpar Filtros
        </button>
      </div>
      {/* FIM DA BARRA DE FILTROS */}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#eee', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>ID</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Remetente</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Destinatário</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Prioridade</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Observação</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Status</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {coletasFiltradas.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>Nenhuma coleta encontrada...</td>
            </tr>
          ) : (
            coletasFiltradas.map((coleta) => (
              <tr key={coleta.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{coleta.id}</td>
                <td style={{ padding: '10px' }}>{coleta.remetente}</td>
                <td style={{ padding: '10px' }}>{coleta.destinatario}</td>
                <td style={{ padding: '10px', color: coleta.prioridade === 1 ? 'red' : 'black', fontWeight: coleta.prioridade === 1 ? 'bold' : 'normal' }}>
                  {traduzirPrioridade(coleta.prioridade)}
                </td>
                
                <td 
                  style={{ 
                    padding: '10px', 
                    maxWidth: '150px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} 
                  title={coleta.observacao}
                >
                  {coleta.observacao || '-'} 
                </td>

                <td style={{ padding: '10px' }}>
                  <strong>{traduzirStatus(coleta.status)}</strong>
                </td>
                
               <td style={{ padding: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>

                 {coleta.ocorrencias && coleta.ocorrencias.length > 0 && (
                    <button onClick={() => verHistorico(coleta)} style={{ padding: '5px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                      Histórico
                    </button>
                  )}

                  {coleta.status === 0 && (
                    <button onClick={() => handleAtribuir(coleta.id)} style={{ padding: '5px', backgroundColor: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                      Atribuir
                    </button>
                  )}
                  
                  {/* Só mostra o botão Finalizar se o status for 1 (Atribuída) */}
                  {coleta.status === 1 && (
                    <button onClick={() => handleFinalizar(coleta.id)} style={{ padding: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                      Confirmar Coleta
                    </button>
                  )}

                  {/* Ocorrência (Disponível se não estiver cancelada) */}
                  {(coleta.status === 0 || coleta.status === 1) && (
                    <button onClick={() => handleOcorrencia(coleta.id)} style={{ padding: '5px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                      Ocorrência
                    </button>
                  )}

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