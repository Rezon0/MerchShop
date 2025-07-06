// MerchShop.WebAPI/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using MerchShop.Core.Data;
using MerchShop.Core.Models;
using MerchShop.WebAPI.DTOs;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; // For SingleOrDefaultAsync, Where, FirstOrDefaultAsync
using BCrypt.Net; // For password hashing and verification
using MerchShop.WebAPI.Services; // For ITokenService
using System.Security.Claims; // For ClaimTypes
using System.Linq; // For LINQ methods like FirstOrDefault

namespace MerchShop.WebAPI.Controllers
{
    [ApiController] // Indicates that this is an API controller
    [Route("api/[controller]")] // Defines the route for the controller: /api/Auth
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService; // Dependency injection for token service

        // Constructor: injects ApplicationDbContext and ITokenService via DI
        public AuthController(ApplicationDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        /// <summary>
        /// Registers a new user.
        /// </summary>
        /// <param name="request">User registration data.</param>
        /// <returns>200 OK status on successful registration, otherwise 400 Bad Request.</returns>
        [HttpPost("register")] // Route: /api/Auth/register
        public async Task<ActionResult> Register([FromBody] RegisterRequest request)
        {
            // 1. Validate incoming DTO data
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Returns validation errors
            }

            // 2. Check if a user with this email already exists
            var existingUser = await _context.Users
                                             .Where(u => u.Email == request.Email)
                                             .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                // User with this email already exists
                return BadRequest(new { message = "Пользователь с таким Email уже зарегистрирован." });
            }

            // 3. Hash the password using BCrypt.Net
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 4. Create a new user entity
            var newUser = new User
            {
                LastName = request.LastName,
                FirstName = request.FirstName,
                MiddleName = request.MiddleName,
                DateOfBirth = request.DateOfBirth, // Ensure type matches (DateTime)
                Phone = request.Phone,
                Email = request.Email,
                GdprConsent = request.GdprConsent,
                PasswordHash = hashedPassword // Store the hashed password
            };

            // 5. Save the user to the database
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // 6. Successful response
            return Ok(new { message = "Регистрация прошла успешно!" });
        }

        /// <summary>
        /// Authenticates a user and issues an Access Token and Refresh Token.
        /// </summary>
        /// <param name="request">User login data (Email, Password).</param>
        /// <returns>Access Token and Refresh Token on successful login, otherwise 400 Bad Request or 401 Unauthorized.</returns>
        [HttpPost("login")] // Route: /api/Auth/login
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == request.Email);

            // Check if user exists and password is correct
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Неверный Email или пароль." });
            }

            // Generate Access Token
            var accessToken = _tokenService.GenerateAccessToken(user);

            // Generate and save Refresh Token
            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // Refresh Token valid for 7 days

            await _context.SaveChangesAsync();

            return Ok(new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Message = "Вход выполнен успешно!",
                UserId = user.Id,
                UserName = user.FirstName // Or another name to display
            });
        }

        /// <summary>
        /// Refreshes an Access Token using a Refresh Token.
        /// </summary>
        /// <param name="tokenRequest">Object containing Access Token and Refresh Token.</param>
        /// <returns>New Access Token and Refresh Token.</returns>
        [HttpPost("refresh")] // Route: /api/Auth/refresh
        public async Task<ActionResult<LoginResponse>> Refresh([FromBody] TokenRequest tokenRequest)
        {
            var accessToken = tokenRequest.AccessToken;
            var refreshToken = tokenRequest.RefreshToken;

            // Get principal from expired access token to extract user ID
            var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);
            var userId = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
            {
                return BadRequest("Неверный токен клиента.");
            }

            // Find user by ID
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == int.Parse(userId));

            // Validate refresh token and its expiry
            if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return BadRequest("Неверный Refresh Token или он просрочен.");
            }

            // Generate new Access and Refresh Tokens
            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            // Update user's refresh token in DB
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // Update expiry time
            await _context.SaveChangesAsync();

            return Ok(new LoginResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                Message = "Токен обновлен успешно!",
                UserId = user.Id,
                UserName = user.FirstName
            });
        }
    }

    // Helper DTO for token refresh request
    public class TokenRequest
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
