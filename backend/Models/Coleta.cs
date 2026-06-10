namespace backend.Models;

public class  Coleta
{
    public int Id { get; set; }
    public string Remetente { get; set; } = string.Empty;
    public string Destinatario { get; set; } = string.Empty;
    public DateTime DataPrevista { get; set; }
    public Prioridade Prioridade { get; set; } = Prioridade.Normal;
    public string Observacao { get; set; } = string.Empty;
    public StatusColeta Status { get; set; } = StatusColeta.Aberta;

    // Relacionamentos (Podem ser nulos no início)
    public int? MotoristaId { get; set; }
    public Motorista? Motorista { get; set; }

    public int? VeiculoId { get; set; }
    public Veiculo? Veiculo { get; set; }

    // Uma coleta pode ter várias ocorrências registadas
    public List<Ocorrencia> Ocorrencias { get; set; } = new();
}