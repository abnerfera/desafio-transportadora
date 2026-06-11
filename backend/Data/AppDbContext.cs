using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Coleta> Coletas { get; set; }
    public DbSet<Motorista> Motoristas { get; set; }
    public DbSet<Veiculo> Veiculos { get; set; }
    public DbSet<Ocorrencia> Ocorrencias { get; set; }

    // Este método é executado quando o modelo do banco está a ser construído
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed (Dados Iniciais) para Motoristas
        modelBuilder.Entity<Motorista>().HasData(
            new Motorista { Id = 1, Nome = "Carlos Silva", Cnh = "123456789" },
            new Motorista { Id = 2, Nome = "Ana Souza", Cnh = "987654321" }
        );

        // Seed (Dados Iniciais) para Veículos
        modelBuilder.Entity<Veiculo>().HasData(
            new Veiculo { Id = 1, Placa = "ABC-1234", Modelo = "Volvo FH 540" },
            new Veiculo { Id = 2, Placa = "XYZ-9876", Modelo = "Mercedes-Benz Accelo" }
        );
    }
}