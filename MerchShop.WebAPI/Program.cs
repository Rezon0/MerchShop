// MerchShop.WebAPI/Program.cs

// Добавьте эти using директивы
using MerchShop.Core.Data; // Для ApplicationDbContext
using Microsoft.EntityFrameworkCore; // Для UseNpgsql, Migrate
using Npgsql.EntityFrameworkCore.PostgreSQL; // Явно для провайдера Npgsql

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
// НАСТРОЙКА ENTITY FRAMEWORK CORE И POSTGRESQL (перемещено сюда)
// ===============================================================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
// ===============================================================

builder.Services.AddControllers(); // Используем AddControllers() для Web API

var app = builder.Build();

// Настройка конвейера HTTP-запросов.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Опционально: автоматическое применение миграций при запуске в режиме разработки
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        // dbContext.Database.Migrate(); // Закомментируйте, если хотите управлять миграциями вручную
    }
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(); // Применяем политику CORS

app.UseAuthorization();

app.MapControllers(); // Для контроллеров

// *** ВНИМАНИЕ: SPA-специфичные мидлвары удалены из этого проекта ***
// app.UseSpaStaticFiles();
// app.MapFallbackToFile("index.html");
// app.UseSpa(...)

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
