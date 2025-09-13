using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;
using RecruitmentSystem.Api.Models;
using RecruitmentSystem.Api.Repositories;

namespace RecruitmentSystem.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByUsernameAsync(request.Username);
            
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Invalid username or password"
                };
            }

            if (user.Status != "Active")
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Account is not active. Please contact administrator."
                };
            }

            var token = GenerateJwtToken(user);
            var userDto = MapToUserDto(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = userDto
            };
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Check if username already exists
            if (await _userRepository.ExistsByUsernameAsync(request.Username))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Username already exists"
                };
            }

            // Check if email already exists
            if (await _userRepository.ExistsByEmailAsync(request.Email))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Email already exists"
                };
            }

            // Determine user status based on roles
            var isCandidate = request.Roles.Contains("Candidate");
            var internalRoles = request.Roles.Where(r => r != "Candidate").ToList();
            var status = internalRoles.Any() ? "PendingApproval" : "Active";

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Roles = JsonSerializer.Serialize(request.Roles),
                Status = status,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateAsync(user);
            var userDto = MapToUserDto(user);

            var message = internalRoles.Any() 
                ? "Registration successful. Your account is pending admin approval." 
                : "Registration successful.";

            return new AuthResponse
            {
                Success = true,
                Message = message,
                User = userDto
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            return user != null ? MapToUserDto(user) : null;
        }

        private string GenerateJwtToken(User user)
        {
            var roles = JsonSerializer.Deserialize<List<string>>(user.Roles) ?? new List<string>();
            
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Username),
                new(ClaimTypes.Email, user.Email),
                new("FullName", user.FullName)
            };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static UserDto MapToUserDto(User user)
        {
            var roles = JsonSerializer.Deserialize<List<string>>(user.Roles) ?? new List<string>();
            
            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Username = user.Username,
                Roles = roles,
                Status = user.Status,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
