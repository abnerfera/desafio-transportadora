using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Motoristas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Cnh = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Motoristas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Veiculos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Placa = table.Column<string>(type: "text", nullable: false),
                    Modelo = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Veiculos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Coletas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Remetente = table.Column<string>(type: "text", nullable: false),
                    Destinatario = table.Column<string>(type: "text", nullable: false),
                    DataPrevista = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Prioridade = table.Column<int>(type: "integer", nullable: false),
                    Observacao = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    MotoristaId = table.Column<int>(type: "integer", nullable: true),
                    VeiculoId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coletas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Coletas_Motoristas_MotoristaId",
                        column: x => x.MotoristaId,
                        principalTable: "Motoristas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Coletas_Veiculos_VeiculoId",
                        column: x => x.VeiculoId,
                        principalTable: "Veiculos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Ocorrencias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ColetaId = table.Column<int>(type: "integer", nullable: false),
                    DataHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    UsuarioResponsavel = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ocorrencias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ocorrencias_Coletas_ColetaId",
                        column: x => x.ColetaId,
                        principalTable: "Coletas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Coletas_MotoristaId",
                table: "Coletas",
                column: "MotoristaId");

            migrationBuilder.CreateIndex(
                name: "IX_Coletas_VeiculoId",
                table: "Coletas",
                column: "VeiculoId");

            migrationBuilder.CreateIndex(
                name: "IX_Ocorrencias_ColetaId",
                table: "Ocorrencias",
                column: "ColetaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ocorrencias");

            migrationBuilder.DropTable(
                name: "Coletas");

            migrationBuilder.DropTable(
                name: "Motoristas");

            migrationBuilder.DropTable(
                name: "Veiculos");
        }
    }
}
