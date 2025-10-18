using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RecruitmentSystem.Api.Models;
using RecruitmentSystem.Api.Services;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Controllers
{
    [ApiController]
    [Route("api/interview")]
    [Authorize]
    public class InterviewController : ControllerBase
    {
        private readonly IInterviewService _interviewService;
        private readonly ILogger<InterviewController> _logger;

        public InterviewController(IInterviewService interviewService, ILogger<InterviewController> logger)
        {
            _interviewService = interviewService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<InterviewDto>>> GetAllInterviews()
        {
            try
            {
                var interviews = await _interviewService.GetAllInterviewsAsync();
                return Ok(interviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving interviews");
                return StatusCode(500, new { message = "Error retrieving interviews", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InterviewDto>> GetInterview(int id)
        {
            try
            {
                var interview = await _interviewService.GetInterviewByIdAsync(id);
                if (interview == null)
                {
                    return NotFound(new { message = "Interview not found" });
                }
                return Ok(interview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving interview");
                return StatusCode(500, new { message = "Error retrieving interview", error = ex.Message });
            }
        }

        [HttpGet("candidate/{id}")]
        public async Task<ActionResult<List<InterviewDto>>> GetInterviewsByCandidate(int id)
        {
            try
            {
                var interviews = await _interviewService.GetInterviewsByCandidateIdAsync(id);
                return Ok(interviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving interviews for candidate");
                return StatusCode(500, new { message = "Error retrieving interviews", error = ex.Message });
            }
        }

        [HttpGet("job/{id}")]
        public async Task<ActionResult<List<InterviewDto>>> GetInterviewsByJob(int id)
        {
            try
            {
                var interviews = await _interviewService.GetInterviewsByJobIdAsync(id);
                return Ok(interviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving interviews for job");
                return StatusCode(500, new { message = "Error retrieving interviews", error = ex.Message });
            }
        }

        [HttpGet("interviewer/{id}")]
        public async Task<ActionResult<List<InterviewDto>>> GetInterviewsByInterviewer(int id)
        {
            try
            {
                var interviews = await _interviewService.GetInterviewsByInterviewerIdAsync(id);
                return Ok(interviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving interviews for interviewer");
                return StatusCode(500, new { message = "Error retrieving interviews", error = ex.Message });
            }
        }

        [HttpPost("schedule")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ActionResult<InterviewDto>> ScheduleInterview([FromBody] ScheduleInterviewDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var interview = await _interviewService.ScheduleInterviewAsync(dto);
                return CreatedAtAction(nameof(GetInterview), new { id = interview.Id }, interview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling interview");
                return StatusCode(500, new { message = "Error scheduling interview", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,HR,Interviewer")]
        public async Task<ActionResult<InterviewDto>> UpdateInterviewStatus(int id, [FromBody] UpdateInterviewStatusDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var interview = await _interviewService.UpdateInterviewStatusAsync(id, dto);
                if (interview == null)
                {
                    return NotFound(new { message = "Interview not found" });
                }
                return Ok(interview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating interview status");
                return StatusCode(500, new { message = "Error updating interview status", error = ex.Message });
            }
        }

        [HttpPost("{id}/feedback")]
        [Authorize(Roles = "Admin,HR,Interviewer")]
        public async Task<ActionResult<Feedback>> AddInterviewFeedback(int id, [FromBody] InterviewFeedbackDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var feedback = await _interviewService.AddInterviewFeedbackAsync(id, dto);
                return Ok(feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding interview feedback");
                return StatusCode(500, new { message = "Error adding feedback", error = ex.Message });
            }
        }

        [HttpGet("{id}/feedbacks")]
        public async Task<ActionResult<List<FeedbackDto>>> GetInterviewFeedbacks(int id)
        {
            try
            {
                var feedbacks = await _interviewService.GetInterviewFeedbacksAsync(id);
                return Ok(feedbacks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving interview feedbacks");
                return StatusCode(500, new { message = "Error retrieving feedbacks", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteInterview(int id)
        {
            try
            {
                var success = await _interviewService.DeleteInterviewAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Interview not found" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting interview");
                return StatusCode(500, new { message = "Error deleting interview", error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }
    }
}
