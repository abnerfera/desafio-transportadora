using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Aqui estamos dizendo quais classes vão virar tabelas no banco de dados
    public DbSet<Coleta> Coletas { get; set; }
    public DbSet<Motorista> Motoristas { get; set; }
    public DbSet<Veiculo> Veiculos { get; set; }
    public DbSet<Ocorrencia> Ocorrencias { get; set; }
}