using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController] // Avisa ao C# que esta classe é uma API
[Route("api/[controller]")] // A URL será: http://localhost:porta/api/coleta
public class ColetaController : ControllerBase
{
    private readonly AppDbContext _context;

    // Construtor: Puxamos o nosso banco de dados (AppDbContext) para dentro do controller
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
            .ToListAsync();

        return Ok(coletas); // Retorna um status 200 (Sucesso) com a lista
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
}