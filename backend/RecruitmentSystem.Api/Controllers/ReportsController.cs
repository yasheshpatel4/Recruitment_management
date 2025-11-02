using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystem.Api.Services;

namespace RecruitmentSystem.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportsService _reportsService;

        public ReportsController(IReportsService reportsService)
        {
            _reportsService = reportsService;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            try
            {
                var overview = await _reportsService.GetOverviewAsync();
                return Ok(overview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve reports overview", error = ex.Message });
            }
        }

        [HttpGet("candidates-by-status")]
        public async Task<IActionResult> GetCandidatesByStatus()
        {
            try
            {
                var data = await _reportsService.GetCandidatesByStatusAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve candidates by status", error = ex.Message });
            }
        }

        [HttpGet("jobs-by-department")]
        public async Task<IActionResult> GetJobsByDepartment()
        {
            try
            {
                var data = await _reportsService.GetJobsByDepartmentAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve jobs by department", error = ex.Message });
            }
        }

        [HttpGet("interview-trends")]
        public async Task<IActionResult> GetInterviewTrends()
        {
            try
            {
                var data = await _reportsService.GetInterviewTrendsAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve interview trends", error = ex.Message });
            }
        }
    }
}
