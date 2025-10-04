using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RecruitmentSystem.Api.Models;
using RecruitmentSystem.Api.Services;
using System.Security.Claims;

namespace RecruitmentSystem.Api.Controllers
{
    [ApiController]
    [Route("api/jobs")]
    [Authorize(Roles = "HR,Recruiter,Interviewer,Reviewer")]
    public class JobController : ControllerBase
    {
        private readonly IJobService _jobService;
        private readonly ILogger<JobController> _logger;

        public JobController(IJobService jobService, ILogger<JobController> logger)
        {
            _jobService = jobService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<JobDto>>> GetAllJobs()
        {
            try
            {
                var jobs = await _jobService.GetAllJobsAsync();
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving jobs", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JobDto>> GetJob(int id)
        {
            try
            {
                var job = await _jobService.GetJobByIdAsync(id);
                if (job == null)
                {
                    return NotFound(new { message = "Job not found" });
                }
                return Ok(job);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving job", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<JobDto>> CreateJob([FromBody] CreateJobDto createJobDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid request data" });
            }

            try
            {
                var createdBy = GetCurrentUserId();
                var job = await _jobService.CreateJobAsync(createJobDto, createdBy);
                return CreatedAtAction(nameof(GetJob), new { id = job.Id }, job);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating job", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<JobDto>> UpdateJob(int id, [FromBody] UpdateJobDto updateJobDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid request data" });
            }

            try
            {
                var job = await _jobService.UpdateJobAsync(id, updateJobDto);
                if (job == null)
                {
                    return NotFound(new { message = "Job not found" });
                }
                return Ok(job);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating job", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            try
            {
                var result = await _jobService.DeleteJobAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Job not found" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting job", error = ex.Message });
            }
        }

        [HttpGet("skills")]
        public async Task<ActionResult<List<SkillDto>>> GetSkills()
        {
            try
            {
                var skills = await _jobService.GetAllSkillsAsync();
                return Ok(skills);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving skills", error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }
    }
}
