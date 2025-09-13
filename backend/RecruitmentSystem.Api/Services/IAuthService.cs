using RecruitmentSystem.Api.Models;

namespace RecruitmentSystem.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<UserDto?> GetUserByIdAsync(int id);
    }
}
