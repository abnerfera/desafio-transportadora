using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ColetaController : ControllerBase
{
    private readonly AppDbContext _context;

    public ColetaController(AppDbContext context)
    {
        _context = context;
    }

    // ENDPOINT 1: Listar todas as coletas
    [HttpGet]
    public async Task<IActionResult> ListarColetas()
    {
        // O Include puxa os dados do motorista e veículo (se houver) junto com a coleta
        var coletas = await _context.Coletas
            .Include(c => c.Motorista)
            .Include(c => c.Veiculo)
            .Include(c => c.Ocorrencias)
            .ToListAsync();

        return Ok(coletas); 
    }

    // ENDPOINT 2: Criar uma nova solicitação de coleta
    [HttpPost]
    public async Task<IActionResult> CriarColeta([FromBody] Coleta novaColeta)
    {
        // Regra de negócio: Toda coleta nova nasce com status "Aberta" e sem atribuições
        novaColeta.Status = StatusColeta.Aberta;
        novaColeta.MotoristaId = null;
        novaColeta.VeiculoId = null;

        // Adiciona no banco de dados e salva
        _context.Coletas.Add(novaColeta);
        await _context.SaveChangesAsync();

        return Created("", novaColeta); // Retorna status 201 (Criado)
    }

    // ENDPOINT 3: Atribuir Motorista e Veículo a uma Coleta
    [HttpPatch("{id}/atribuir")]
    public async Task<IActionResult> Atribuir(int id, [FromBody] AtribuirDto dto)
    {
        var coleta = await _context.Coletas.FindAsync(id);
        if (coleta == null) return NotFound("Coleta não encontrada.");

        // Regra de Negócio: Pedido cancelado não pode voltar ao fluxo ativo
        if (coleta.Status == StatusColeta.Cancelada)
            return BadRequest("Não é possível alterar uma coleta que já foi cancelada.");

        coleta.MotoristaId = dto.MotoristaId;
        coleta.VeiculoId = dto.VeiculoId;
        coleta.Status = StatusColeta.Atribuida;

        await _context.SaveChangesAsync();
        return Ok(coleta);
    }

    // ENDPOINT 4: Marcar coleta como concluída
    [HttpPatch("{id}/finalizar")]
    public async Task<IActionResult> FinalizarColeta(int id)
    {
        var coleta = await _context.Coletas.FindAsync(id);
        if (coleta == null) return NotFound("Coleta não encontrada.");

        // Regra de Negócio: Pedido cancelado não pode voltar ao fluxo
        if (coleta.Status == StatusColeta.Cancelada)
            return BadRequest("Uma coleta cancelada não pode ser marcada como coletada.");

        // Regra de Negócio: Não é permitido marcar como Coletada sem motorista e veículo vinculados
        if (coleta.MotoristaId == null || coleta.VeiculoId == null)
            return BadRequest("É obrigatório vincular um motorista e um veículo antes de finalizar a coleta.");

        coleta.Status = StatusColeta.Coletada;

        await _context.SaveChangesAsync();
        return Ok(coleta);
    }

    // ENDPOINT 5: Cancelar a coleta
    [HttpPatch("{id}/cancelar")]
    public async Task<IActionResult> CancelarColeta(int id)
    {
        var coleta = await _context.Coletas.FindAsync(id);
        if (coleta == null) return NotFound("Coleta não encontrada.");

        if (coleta.Status == StatusColeta.Cancelada)
            return BadRequest("Esta coleta já encontra-se cancelada.");

        coleta.Status = StatusColeta.Cancelada;

        await _context.SaveChangesAsync();
        return Ok(coleta);
    }

    // ENDPOINT 6: Registrar uma nova ocorrência na coleta
    [HttpPost("{id}/ocorrencia")]
    public async Task<IActionResult> RegistrarOcorrencia(int id, [FromBody] OcorrenciaDto dto)
    {
        var coleta = await _context.Coletas.FindAsync(id);
        if (coleta == null) return NotFound("Coleta não encontrada.");

        // Cria a ocorrência e carimba a hora do servidor (UtcNow)
        var ocorrencia = new Ocorrencia
        {
            ColetaId = id,
            Descricao = dto.Descricao,
            UsuarioResponsavel = dto.UsuarioResponsavel,
            DataHora = DateTime.UtcNow 
        };

        _context.Ocorrencias.Add(ocorrencia);
        await _context.SaveChangesAsync();

        return Ok(ocorrencia);
    }
}