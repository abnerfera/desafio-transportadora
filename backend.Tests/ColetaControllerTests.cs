using System;
using System.Threading.Tasks;
using backend.Controllers;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace backend.Tests;

public class ColetaControllerTests
{
    // Método auxiliar para criar um banco de dados na memória limpo para cada teste
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            
        return new AppDbContext(options);
    }

    // TESTE 1: Garante que coleta cancelada não pode ser atribuída
    [Fact]
    public async Task Atribuir_ColetaCancelada_RetornaBadRequest()
    {
        // 1. Arrange (Preparação)
        var context = GetDbContext();
        var coleta = new Coleta 
        { 
            Id = 1, 
            Remetente = "Cliente A", 
            Destinatario = "Destino B", 
            Status = StatusColeta.Cancelada // <- Já nasce cancelada no banco falso
        };
        context.Coletas.Add(coleta);
        await context.SaveChangesAsync();

        var controller = new ColetaController(context);
        var dto = new AtribuirDto { MotoristaId = 1, VeiculoId = 1 };

        // 2. Act (Ação)
        var resultado = await controller.Atribuir(1, dto);

        // 3. Assert (Verificação)
        // Confirma se o tipo de retorno foi um BadRequest (Erro 400)
        var badRequest = Assert.IsType<BadRequestObjectResult>(resultado);
        // Confirma se a mensagem de erro é exatamente a que você programou
        Assert.Equal("Não é possível alterar uma coleta que já foi cancelada.", badRequest.Value);
    }

    // TESTE 2: Garante que não finaliza sem motorista e veículo
    [Fact]
    public async Task FinalizarColeta_SemAtribuicao_RetornaBadRequest()
    {
        // 1. Arrange
        var context = GetDbContext();
        var coleta = new Coleta 
        { 
            Id = 2, 
            Remetente = "Cliente C", 
            Destinatario = "Destino D", 
            Status = StatusColeta.Aberta,
            MotoristaId = null, // <- Faltando motorista
            VeiculoId = null    // <- Faltando veículo
        };
        context.Coletas.Add(coleta);
        await context.SaveChangesAsync();

        var controller = new ColetaController(context);

        // 2. Act
        var resultado = await controller.FinalizarColeta(2);

        // 3. Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(resultado);
        Assert.Equal("É obrigatório vincular um motorista e um veículo antes de finalizar a coleta.", badRequest.Value);
    }
}