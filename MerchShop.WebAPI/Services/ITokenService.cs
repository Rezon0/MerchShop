using MerchShop.Core.Models;
using System.Security.Claims;

namespace MerchShop.WebAPI.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
    }
}