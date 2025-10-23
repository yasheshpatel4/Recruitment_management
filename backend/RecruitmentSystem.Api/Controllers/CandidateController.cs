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
            [FromQuery] string? skills = null,
            [FromQuery] string? search = null)
        {
            try
            {
                var jobs = await _candidateService.GetOpenJobsAsync(page, pageSize, location, experience, skills, search);
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

                // Update user properties if provided
                if (updateDto.FullName != null)
                {
                    candidate.User.FullName = updateDto.FullName;
                }
                if (updateDto.Email != null)
                {
                    candidate.User.Email = updateDto.Email;
                }
                candidate.User.UpdatedAt = DateTime.UtcNow;

                // Update skills if provided
                if (updateDto.Skills != null)
                {
                    // Clear existing skills
                    candidate.CandidateSkills.Clear();

                    // Add new skills
                    foreach (var skillName in updateDto.Skills)
                    {
                        if (!string.IsNullOrWhiteSpace(skillName))
                        {
                            var skill = await _candidateService.GetOrCreateSkillAsync(skillName.Trim());
                            candidate.CandidateSkills.Add(new CandidateSkill
                            {
                                CandidateId = candidate.Id,
                                SkillId = skill.Id,
                                ExperienceYears = 0 // Default value, could be enhanced later
                            });
                        }
                    }
                }

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

        [HttpDelete("document/{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var candidate = await _candidateService.GetCandidateByUserIdAsync(userId);

                if (candidate == null)
                {
                    return NotFound(new { message = "Candidate profile not found" });
                }

                var success = await _candidateService.DeleteDocumentAsync(id, candidate.Id);

                if (!success)
                {
                    return NotFound(new { message = "Document not found or does not belong to this candidate" });
                }

                return Ok(new { message = "Document deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document");
                return StatusCode(500, new { message = "Error deleting document", error = ex.Message });
            }
        }

        [HttpPost("verify-document/{id}")]
        [Authorize(Roles = "HR")]
        public async Task<IActionResult> VerifyDocument(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _candidateService.VerifyDocumentAsync(id, userId);

                if (!success)
                {
                    return NotFound(new { message = "Document not found" });
                }

                return Ok(new { message = "Document verified successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying document");
                return StatusCode(500, new { message = "Error verifying document", error = ex.Message });
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
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Bio { get; set; }
        public List<string>? Skills { get; set; }
    }
}
