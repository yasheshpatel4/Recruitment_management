using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentSystem.Api.Data;
using RecruitmentSystem.Api.Models;

namespace RecruitmentSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SkillsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SkillsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<SkillDto>>> GetSkills()
        {
            try
            {
                var skills = await _context.Skills
                    .OrderBy(s => s.Name)
                    .Select(s => new SkillDto
                    {
                        Id = s.Id,
                        Name = s.Name
                    })
                    .ToListAsync();

                return Ok(skills);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving skills", error = ex.Message });
            }
        }
    }
}
