using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RecruitmentSystem.Api.Models;
using RecruitmentSystem.Api.Services;
using System.Security.Claims;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace RecruitmentSystem.Api.Controllers
{
    [ApiController]
    [Route("api/candidate")]
    [Authorize(Roles = "Candidate")]
    public class CandidateController : ControllerBase
    {
        private readonly ICandidateService _candidateService;
        private readonly ILogger<CandidateController> _logger;

        public CandidateController(ICandidateService candidateService, ILogger<CandidateController> logger)
        {
            _candidateService = candidateService;
            _logger = logger;
        }

        [HttpGet("jobs")]
        public async Task<ActionResult<List<Job>>> GetOpenJobs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? location = null,
            [FromQuery] int? experience = null,
            [FromQuery] string? skills = null)
        {
            try
            {
                var jobs = await _candidateService.GetOpenJobsAsync(page, pageSize, location, experience, skills);
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving open jobs");
                return StatusCode(500, new { message = "Error retrieving jobs", error = ex.Message });
            }
        }

        [HttpGet("profile")]
        public async Task<ActionResult<Candidate>> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                var candidate = await _candidateService.GetCandidateByUserIdAsync(userId);

                if (candidate == null)
                {
                    return NotFound(new { message = "Candidate profile not found" });
                }

                return Ok(candidate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving candidate profile");
                return StatusCode(500, new { message = "Error retrieving profile", error = ex.Message });
            }
        }

        [HttpPut("profile")]
        public async Task<ActionResult<Candidate>> UpdateProfile([FromBody] UpdateCandidateDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var candidate = await _candidateService.GetCandidateByUserIdAsync(userId);

                if (candidate == null)
                {
                    return NotFound(new { message = "Candidate profile not found" });
                }

                // Update candidate properties
                candidate.ExperienceYears = updateDto.ExperienceYears ?? candidate.ExperienceYears;
                candidate.UpdatedAt = DateTime.UtcNow;

                var updatedCandidate = await _candidateService.UpdateCandidateAsync(candidate);
                return Ok(updatedCandidate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating candidate profile");
                return StatusCode(500, new { message = "Error updating profile", error = ex.Message });
            }
        }

        [HttpPost("upload-cv")]
        public async Task<ActionResult<Document>> UploadCV(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded" });
                }

                // Validate file type
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "Invalid file type. Only PDF, DOC, and DOCX files are allowed." });
                }

                // Validate file size (10MB limit)
                if (file.Length > 10 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size exceeds 10MB limit." });
                }

                var userId = GetCurrentUserId();
                var candidate = await _candidateService.GetCandidateByUserIdAsync(userId);

                if (candidate == null)
                {
                    return NotFound(new { message = "Candidate profile not found" });
                }

                // Create uploads directory if it doesn't exist
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "cvs");
                Directory.CreateDirectory(uploadsDir);

                // Generate unique filename
                var fileName = $"{candidate.Id}_cv_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Save document record
                var document = await _candidateService.UploadDocumentAsync(
                    candidate.Id,
                    "CV",
                    file.FileName,
                    filePath
                );

                return Ok(document);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading CV");
                return StatusCode(500, new { message = "Error uploading CV", error = ex.Message });
            }
        }

        [HttpPost("upload-document")]
        public async Task<ActionResult<Document>> UploadDocument(IFormFile file, [FromForm] string documentType)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded" });
                }

                if (string.IsNullOrWhiteSpace(documentType))
                {
                    return BadRequest(new { message = "Document type is required" });
                }

                // Validate file type
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png" };
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed." });
                }

                // Validate file size (5MB limit for documents)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size exceeds 5MB limit." });
                }

                var userId = GetCurrentUserId();
                var candidate = await _candidateService.GetCandidateByUserIdAsync(userId);

                if (candidate == null)
                {
                    return NotFound(new { message = "Candidate profile not found" });
                }

                // Create uploads directory if it doesn't exist
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "documents");
                Directory.CreateDirectory(uploadsDir);

                // Generate unique filename
                var fileName = $"{candidate.Id}_{documentType.ToLower().Replace(" ", "_")}_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Save document record
                var document = await _candidateService.UploadDocumentAsync(
                    candidate.Id,
                    documentType,
                    file.FileName,
                    filePath
                );

                return Ok(document);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document");
                return StatusCode(500, new { message = "Error uploading document", error = ex.Message });
            }
        }

        [HttpGet("documents")]
        public async Task<ActionResult<List<Document>>> GetDocuments()
        {
            try
            {
                var userId = GetCurrentUserId();
                var candidate = await _candidateService.GetCandidateByUserIdAsync(userId);

                if (candidate == null)
                {
                    return NotFound(new { message = "Candidate profile not found" });
                }

                var documents = await _candidateService.GetCandidateDocumentsAsync(candidate.Id);
                return Ok(documents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving documents");
                return StatusCode(500, new { message = "Error retrieving documents", error = ex.Message });
            }
        }

        [HttpPost("apply/{jobId}")]
        public async Task<IActionResult> ApplyForJob(int jobId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var candidate = await _candidateService.GetCandidateByUserIdAsync(userId);

                if (candidate == null)
                {
                    return NotFound(new { message = "Candidate profile not found" });
                }

                var success = await _candidateService.ApplyForJobAsync(candidate.Id, jobId);

                if (!success)
                {
                    return BadRequest(new { message = "Already applied for this job" });
                }

                return Ok(new { message = "Successfully applied for the job" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying for job");
                return StatusCode(500, new { message = "Error applying for job", error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }
    }

    public class UpdateCandidateDto
    {
        public int? ExperienceYears { get; set; }
    }
}
