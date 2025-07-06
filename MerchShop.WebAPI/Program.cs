// MerchShop.WebAPI/Program.cs
using MerchShop.Core.Data;
using MerchShop.WebAPI.Services; // Добавьте эту директиву
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Добавьте эту директиву
using Microsoft.IdentityModel.Tokens; // Добавьте эту директиву
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Добавляем службы в контейнер.

// Настройка CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // React Dev Server
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Важно для куки, если будете использовать HttpOnly куки для refresh токена
        });
});

builder.Services.AddHttpsRedirection(options =>
{
    options.HttpsPort = 7232;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===============================================================
// НАСТРОЙКА JWT АУТЕНТИФИКАЦИИ
// ===============================================================
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthorization(); // Добавьте службу авторизации

// ===============================================================
// НАСТРОЙКА JWT АУТЕНТИФИКАЦИИ - КОНЕЦ
// ===============================================================


// ===============================================================
// НАСТРОЙКА ENTITY FRAMEWORK CORE И POSTGRESQL
// ===============================================================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("MerchShop.WebAPI")));
// ===============================================================

// Регистрируем ITokenService
builder.Services.AddScoped<ITokenService, TokenService>();


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve; // Оставляем, если нужно для других моделей
        options.JsonSerializerOptions.WriteIndented = true;
    });


var app = builder.Build();

// Настройка конвейера HTTP-запросов.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();

// --- ВАЖНО: UseAuthentication и UseAuthorization должны быть здесь ---
app.UseCors(); // Применяем политику CORS (должен быть до UseAuthentication)
app.UseAuthentication(); // Добавьте этот middleware
app.UseAuthorization(); // Добавьте этот middleware

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}