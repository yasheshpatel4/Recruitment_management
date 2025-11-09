using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentSystem.Api.Data;
using RecruitmentSystem.Api.Models;
using System.Security.Claims;
using System.Text.Json;

namespace RecruitmentSystem.Api.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("interviewers")]
        public async Task<ActionResult<List<UserDto>>> GetInterviewers()
        {
            try
            {
                var interviewers = await _context.Users
                    .Where(u => u.Status == "Active" && u.Roles.Contains("Interviewer"))
                    .ToListAsync();

                var interviewerDtos = interviewers.Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Username = u.Username,
                    Roles = JsonSerializer.Deserialize<List<string>>(u.Roles) ?? new List<string>(),
                    Status = u.Status,
                    CreatedAt = u.CreatedAt
                }).ToList();

                return Ok(interviewerDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving interviewers", error = ex.Message });
            }
        }
    }
}
