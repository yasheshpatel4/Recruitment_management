using Microsoft.AspNetCore.Mvc;
using RecruitmentSystem.Api.Models;
using RecruitmentSystem.Api.Services;

namespace RecruitmentSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid request data"
                });
            }

            var result = await _authService.LoginAsync(request);
            
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid request data"
                });
            }

            var result = await _authService.RegisterAsync(request);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("user/{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _authService.GetUserByIdAsync(id);
            
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
    }
}
