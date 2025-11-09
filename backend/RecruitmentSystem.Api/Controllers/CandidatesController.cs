using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentSystem.Api.Data;
using RecruitmentSystem.Api.Models;
using System.Security.Claims;

namespace RecruitmentSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CandidatesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CandidatesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<CandidateDto>>> GetCandidates()
        {
            try
            {
                var candidates = await _context.Candidates
                    .Include(c => c.User)
                    .Include(c => c.UpdatedByUser)
                    .Include(c => c.CandidateSkills)
                    .ThenInclude(cs => cs.Skill)
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new CandidateDto
                    {
                        Id = c.Id,
                        FullName = c.User.FullName,
                        Email = c.User.Email,
                        ExperienceYears = c.ExperienceYears,
                        Status = c.Status,
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt,
                        UpdatedBy = c.UpdatedByUser != null ? c.UpdatedByUser.FullName : null,
                        Skills = c.CandidateSkills.Select(cs => cs.Skill.Name).ToList()
                    })
                    .ToListAsync();

                return Ok(candidates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving candidates", error = ex.Message });
            }
        }
    }
}
