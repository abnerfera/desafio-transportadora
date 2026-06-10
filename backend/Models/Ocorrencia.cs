namespace backend.Models;

public class Ocorrencia
{
    public int Id { get; set; }
    public int ColetaId { get; set; }
    public DateTime DataHora { get; set; } = DateTime.UtcNow;
    public string Descricao { get; set; } = string.Empty;
    public string UsuarioResponsavel { get; set; } = string.Empty;
}