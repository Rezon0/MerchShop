// MerchShop.WebAPI/Program.cs

// Добавьте эти using директивы
using MerchShop.Core.Data; // Для ApplicationDbContext
using Microsoft.EntityFrameworkCore; // Для UseNpgsql, Migrate
using Npgsql.EntityFrameworkCore.PostgreSQL; // Явно для провайдера Npgsql
using System.Text.Json.Serialization; // Добавлено для ReferenceHandler.Preserve
// Также убедитесь, что у вас есть эти для SPA, если они были ранее
// using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
// using Microsoft.AspNetCore.SpaServices.StaticFiles;


var builder = WebApplication.CreateBuilder(args);

// Добавляем службы в контейнер.

// Настройка CORS (Cross-Origin Resource Sharing)
// Это позволит вашему React-приложению (на другом порту) обращаться к этому API
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", // Порт, на котором обычно работает React Dev Server
                               "https://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddHttpsRedirection(options =>
{
    options.HttpsPort = 7232;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===============================================================
// НАСТРОЙКА ENTITY FRAMEWORK CORE И POSTGRESQL
// ===============================================================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        // ЭТА СТРОКА ГОВОРИТ EF Core, ГДЕ ИСКАТЬ МИГРАЦИИ!
        b => b.MigrationsAssembly("MerchShop.WebAPI")));
// ===============================================================

// Используем AddControllers() для Web API и настраиваем JSON-сериализацию
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
        options.JsonSerializerOptions.WriteIndented = true; // Для более читаемого JSON в разработке
    });


var app = builder.Build();

// Настройка конвейера HTTP-запросов.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Опционально: автоматическое применение миграций при запуске в режиме разработки
    // ИСПОЛЬЗУЙТЕ С ОСТОРОЖНОСТЬЮ! ЛУЧШЕ УПРАВЛЯТЬ МИГРАЦИЯМИ ВРУЧНУЮ ЧЕРЕЗ dotnet ef database update
    /*
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.Migrate();
    }
    */
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(); // Применяем политику CORS

app.UseAuthorization();

app.MapControllers(); // Для контроллеров

// *** ВНИМАНИЕ: SPA-специфичные мидлвары удалены из этого проекта, если вы не используете интеграцию SPA в один проект ***
// Если вы хотите интегрировать React в тот же проект WebAPI, как обсуждалось ранее,
// эти строки должны быть, а не закомментированы. Однако, если у вас отдельный клиентский проект,
// то они не нужны здесь.
/*
app.UseSpaStaticFiles();
app.MapFallbackToFile("index.html");
app.UseSpa(spa =>
{
    spa.Options.SourcePath = "clientapp";
    if (app.Environment.IsDevelopment())
    {
        spa.UseReactDevelopmentServer(npmScript: "start");
    }
});
*/

app.MapGet("/weatherforecast", () =>
{
    var summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
