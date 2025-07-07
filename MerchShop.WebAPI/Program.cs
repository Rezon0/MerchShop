// MerchShop.WebAPI/Program.cs
using MerchShop.Core.Data;
using MerchShop.WebAPI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using System; // Добавлено для TimeSpan
using Microsoft.Extensions.Logging; // Добавлено для ILogger
using System.Security.Claims; // <<< ДОБАВЛЕНО: Для ClaimTypes

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // React Dev Server
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Important for cookies if you use HttpOnly cookies for refresh token
        });
});

builder.Services.AddHttpsRedirection(options =>
{
    options.HttpsPort = 7232;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===============================================================
// CONFIGURE JWT AUTHENTICATION
// ===============================================================
// Логируем значения JWT из конфигурации
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

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
        ValidIssuer = jwtIssuer, // Используем переменную
        ValidAudience = jwtAudience, // Используем переменную
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)), // Используем переменную
        ClockSkew = TimeSpan.Zero // Temporarily set ClockSkew to 0 for debugging
    };

    // Отключаем маппинг входящих клеймов, чтобы ClaimTypes.NameIdentifier не перезаписывался
    options.MapInboundClaims = false; // <<< ЭТО ВАЖНОЕ ИЗМЕНЕНИЕ

    // Добавляем обработчики событий для детального логирования
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<JwtBearerHandler>>();
            logger.LogError(context.Exception, "Authentication failed. Error type: {ErrorType}, Message: {ErrorMessage}", context.Exception.GetType().Name, context.Exception.Message);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<JwtBearerHandler>>();
            logger.LogInformation("Token successfully validated for user: {UserName}. User ID: {UserId}", context.Principal?.Identity?.Name, context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<JwtBearerHandler>>();
            logger.LogWarning("Authentication challenge occurred. Error: {Error}, Description: {Description}", context.Error, context.ErrorDescription);
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(); // Add authorization service

// ===============================================================
// JWT AUTHENTICATION CONFIGURATION - END
// ===============================================================


// ===============================================================
// CONFIGURE ENTITY FRAMEWORK CORE AND POSTGRESQL
// ===============================================================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("MerchShop.WebAPI")));
// ===============================================================

// Register ITokenService
builder.Services.AddScoped<ITokenService, TokenService>();


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve; // УДАЛЕНО: Временно удаляем для отладки
        options.JsonSerializerOptions.WriteIndented = true;
    });


var app = builder.Build();

// Логируем значения JWT после сборки приложения, но до запуска HTTP-конвейера
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("JWT Configuration: Key = {JwtKey}, Issuer = {JwtIssuer}, Audience = {JwtAudience}", jwtKey, jwtIssuer, jwtAudience);


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();

// --- Добавляем логирование заголовков запроса ЗДЕСЬ ---
app.Use(async (context, next) =>
{
    var requestLogger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    requestLogger.LogInformation("Incoming Request Path: {Path}", context.Request.Path);
    foreach (var header in context.Request.Headers)
    {
        requestLogger.LogInformation("Header: {Key} = {Value}", header.Key, header.Value);
    }
    await next.Invoke();
});
// --- Конец логирования заголовков запроса ---

// --- IMPORTANT: UseAuthentication and UseAuthorization must be here ---
app.UseCors(); // Apply CORS policy
app.UseAuthentication(); // Add this middleware
app.UseAuthorization(); // Add this middleware

// --- Добавляем логирование статуса аутентификации ЗДЕСЬ ---
app.Use(async (context, next) =>
{
    var authStatusLogger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    if (context.User?.Identity?.IsAuthenticated == true)
    {
        authStatusLogger.LogInformation("User is authenticated at this point. Name: {UserName}. User ID from ClaimTypes.NameIdentifier: {UserIdClaim}", context.User.Identity.Name, context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    }
    else
    {
        authStatusLogger.LogInformation("User is NOT authenticated at this point. Path: {Path}", context.Request.Path);
    }
    await next.Invoke();
});
// --- Конец логирования статуса аутентификации ---

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
