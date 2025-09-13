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
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("pending-users")]
        public async Task<ActionResult<List<UserDto>>> GetPendingUsers()
        {
            var pendingUsers = await _context.Users
                .Where(u => u.Status == "PendingApproval")
                .ToListAsync();

            var userDtos = pendingUsers.Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Username = u.Username,
                Roles = JsonSerializer.Deserialize<List<string>>(u.Roles) ?? new List<string>(),
                Status = u.Status,
                CreatedAt = u.CreatedAt
            }).ToList();

            return Ok(userDtos);
        }

        [HttpGet("all-users")]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            var users = await _context.Users
                .ToListAsync();

            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Username = u.Username,
                Roles = JsonSerializer.Deserialize<List<string>>(u.Roles) ?? new List<string>(),
                Status = u.Status,
                CreatedAt = u.CreatedAt
            }).ToList();

            return Ok(userDtos);
        }

        [HttpPost("approve-user")]
        public async Task<ActionResult<AuthResponse>> ApproveUser([FromBody] UserApprovalRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            
            if (user == null)
            {
                return NotFound(new AuthResponse
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            if (user.Status != "PendingApproval")
            {
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "User is not pending approval"
                });
            }

            if (request.Action.ToLower() == "approve")
            {
                user.Status = "Active";
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "User approved successfully"
                });
            }
            else if (request.Action.ToLower() == "reject")
            {
                user.Status = "Rejected";
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "User rejected"
                });
            }

            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "Invalid action. Use 'approve' or 'reject'"
            });
        }

        [HttpDelete("user/{id}")]
        public async Task<ActionResult<AuthResponse>> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
            {
                return NotFound(new AuthResponse
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            // Prevent deleting admin users
            var roles = JsonSerializer.Deserialize<List<string>>(user.Roles) ?? new List<string>();
            if (roles.Contains("Admin"))
            {
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "Cannot delete admin users"
                });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                Success = true,
                Message = "User deleted successfully"
            });
        }
    }
}
