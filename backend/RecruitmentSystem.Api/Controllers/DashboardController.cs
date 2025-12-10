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
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetAdminDashboard()
        {
            try
            {
                var stats = await GetDashboardStats();
                var recentJobs = await GetRecentJobs(10);
                var recentCandidates = await GetRecentCandidates(10);
                var upcomingInterviews = await GetUpcomingInterviews(10);
                var pendingTasks = await GetPendingTasks();
                var notifications = await GetNotifications(GetCurrentUserId(), 10);

                return Ok(new
                {
                    stats,
                    recentJobs,
                    recentCandidates,
                    upcomingInterviews,
                    pendingTasks,
                    notifications
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading admin dashboard", error = ex.Message });
            }
        }

        [HttpGet("hr")]
        [Authorize(Roles = "HR")]
        public async Task<ActionResult<object>> GetHRDashboard()
        {
            try
            {
                var stats = await GetDashboardStats();
                var recentCandidates = await GetRecentCandidates(10);
                var upcomingInterviews = await GetUpcomingInterviews(10);
                var pendingTasks = await GetPendingTasks();
                var notifications = await GetNotifications(GetCurrentUserId(), 10);

                return Ok(new
                {
                    stats,
                    recentCandidates,
                    upcomingInterviews,
                    pendingTasks,
                    notifications
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading HR dashboard", error = ex.Message });
            }
        }

        [HttpGet("recruiter")]
        [Authorize(Roles = "Recruiter")]
        public async Task<ActionResult<object>> GetRecruiterDashboard()
        {
            try
            {
                var stats = await GetDashboardStats();
                var recentJobs = await GetRecentJobs(10);
                var recentCandidates = await GetRecentCandidates(10);
                var upcomingInterviews = await GetUpcomingInterviews(10);
                var pendingTasks = await GetPendingTasks();
                var notifications = await GetNotifications(GetCurrentUserId(), 10);

                return Ok(new
                {
                    stats,
                    recentJobs,
                    recentCandidates,
                    upcomingInterviews,
                    pendingTasks,
                    notifications
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading recruiter dashboard", error = ex.Message });
            }
        }

        [HttpGet("interviewer")]
        [Authorize(Roles = "Interviewer")]
        public async Task<ActionResult<object>> GetInterviewerDashboard()
        {
            try
            {
                var userId = GetCurrentUserId();
                var stats = await GetDashboardStats();
                var upcomingInterviews = await GetUpcomingInterviewsForUser(userId, 10);
                var pendingTasks = await GetPendingTasksForUser(userId);
                var notifications = await GetNotifications(userId, 10);

                return Ok(new
                {
                    stats,
                    upcomingInterviews,
                    pendingTasks,
                    notifications
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading interviewer dashboard", error = ex.Message });
            }
        }

        [HttpGet("reviewer")]
        [Authorize(Roles = "Reviewer")]
        public async Task<ActionResult<object>> GetReviewerDashboard()
        {
            try
            {
                var userId = GetCurrentUserId();
                var stats = await GetDashboardStats();
                var recentCandidates = await GetRecentCandidates(10);
                var pendingTasks = await GetPendingTasksForUser(userId);
                var notifications = await GetNotifications(userId, 10);

                return Ok(new
                {
                    stats,
                    recentCandidates,
                    pendingTasks,
                    notifications
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading reviewer dashboard", error = ex.Message });
            }
        }

        [HttpGet("candidate")]
        [Authorize(Roles = "Candidate")]
        public async Task<ActionResult<object>> GetCandidateDashboard()
        {
            try
            {
                var userId = GetCurrentUserId();
                var candidate = await _context.Candidates
                    .Include(c => c.User)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (candidate == null)
                {
                    candidate = new Candidate
                    {
                        UserId = userId,
                        ExperienceYears = 0,
                        Status = "Applied",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Candidates.Add(candidate);
                    await _context.SaveChangesAsync();
                }

                var appliedJobs = await _context.CandidateJobs
                    .Include(cj => cj.Job)
                    .Where(cj => cj.CandidateId == candidate.Id)
                    .OrderByDescending(cj => cj.AppliedDate)
                    .Take(10)
                    .Select(cj => new
                    {
                        cj.Id,
                        JobTitle = cj.Job.Title,
                        JobLocation = cj.Job.Location,
                        AppliedDate = cj.AppliedDate,
                        Status = candidate.Status
                    })
                    .ToListAsync();

                var interviews = await _context.Interviews
                    .Include(i => i.Job)
                    .Include(i => i.Interviewers)
                    .ThenInclude(ir => ir.User)
                    .Where(i => i.CandidateId == candidate.Id && i.Status != "Selected")
                    .OrderByDescending(i => i.ScheduledDate)
                    .Take(10)
                    .Select(i => new
                    {
                        i.Id,
                        JobTitle = i.Job.Title,
                        i.InterviewType,
                        i.RoundNo,
                        i.ScheduledDate,
                        i.Status,
                        Interviewers = i.Interviewers.Select(ir => ir.User.FullName).ToList()
                    })
                    .ToListAsync();

                var offers = await _context.Offers
                    .Include(o => o.Job)
                    .Where(o => o.CandidateId == candidate.Id)
                    .OrderByDescending(o => o.OfferDate)
                    .Take(5)
                    .Select(o => new
                    {
                        o.Id,
                        JobTitle = o.Job.Title,
                        o.OfferDate,
                        o.JoiningDate,
                        o.Status
                    })
                    .ToListAsync();

                // Include interviews with status "Selected" as offers
                var selectedInterviews = await _context.Interviews
                    .Include(i => i.Job)
                    .Where(i => i.CandidateId == candidate.Id && i.Status == "Selected")
                    .OrderByDescending(i => i.CompletedAt)
                    .Take(5)
                    .Select(i => new
                    {
                        Id = i.Id,
                        JobTitle = i.Job.Title,
                        OfferDate = i.CompletedAt ?? i.ScheduledDate,
                        JoiningDate = (DateTime?)null,
                        Status = "Selected"
                    })
                    .ToListAsync();

                offers.AddRange(selectedInterviews);

                var notifications = await GetNotifications(userId, 10);

                return Ok(new
                {
                    candidate = new
                    {
                        candidate.Id,
                        candidate.Status,
                        candidate.ExperienceYears,
                        candidate.CreatedAt,
                        candidate.UpdatedAt,
                        User = new
                        {
                            candidate.User.FullName,
                            candidate.User.Email
                        }
                    },
                    appliedJobs,
                    interviews,
                    offers,
                    notifications
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading candidate dashboard", error = ex.Message });
            }
        }

        [HttpGet("others")]
        [Authorize]
        public async Task<ActionResult<object>> GetOthersDashboard()
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == GetCurrentUserId());

                if (user == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                // Parse roles from JSON string
                var roles = System.Text.Json.JsonSerializer.Deserialize<List<string>>(user.Roles) ?? new List<string>();

                // Default to HR dashboard data if user has multiple roles or no specific role
                var stats = await GetDashboardStats();
                var recentCandidates = await GetRecentCandidates(10);
                var upcomingInterviews = await GetUpcomingInterviews(10);
                var pendingTasks = await GetPendingTasks();
                var notifications = await GetNotifications(GetCurrentUserId(), 10);

                // Add recent jobs if user is a recruiter
                List<RecentJobDto> recentJobs = null;
                if (roles.Contains("Recruiter"))
                {
                    recentJobs = await GetRecentJobs(10);
                }

                return Ok(new
                {
                    stats,
                    recentJobs,
                    recentCandidates,
                    upcomingInterviews,
                    pendingTasks,
                    notifications
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading others dashboard", error = ex.Message });
            }
        }

        private async Task<DashboardStatsDto> GetDashboardStats()
        {
            var totalJobs = await _context.Jobs.CountAsync();
            var openJobs = await _context.Jobs.CountAsync(j => j.Status == JobStatus.Open);
            var onHoldJobs = await _context.Jobs.CountAsync(j => j.Status == JobStatus.OnHold);
            var closedJobs = await _context.Jobs.CountAsync(j => j.Status == JobStatus.Closed);

            var totalCandidates = await _context.Candidates.CountAsync();
            var appliedCandidates = await _context.Candidates.CountAsync(c => c.Status == "Applied");
            var shortlistedCandidates = await _context.Candidates.CountAsync(c => c.Status == "Shortlisted");
            var interviewCandidates = await _context.Candidates.CountAsync(c => c.Status == "Interview");
            var selectedCandidates = await _context.Candidates.CountAsync(c => c.Status == "Selected");
            var rejectedCandidates = await _context.Candidates.CountAsync(c => c.Status == "Rejected");
            var onHoldCandidates = await _context.Candidates.CountAsync(c => c.Status == "On Hold");

            var totalInterviews = await _context.Interviews.CountAsync();
            var scheduledInterviews = await _context.Interviews.CountAsync(i => i.Status == "Scheduled");
            var completedInterviews = await _context.Interviews.CountAsync(i => i.Status == "Completed");
            var pendingInterviews = await _context.Interviews.CountAsync(i => i.Status == "Scheduled" && i.ScheduledDate > DateTime.UtcNow);

            var totalOffers = await _context.Offers.CountAsync();
            var pendingOffers = await _context.Offers.CountAsync(o => o.Status == "Offered");
            var acceptedOffers = await _context.Offers.CountAsync(o => o.Status == "Accepted");
            var rejectedOffers = await _context.Offers.CountAsync(o => o.Status == "Rejected");

            return new DashboardStatsDto
            {
                TotalJobs = totalJobs,
                OpenJobs = openJobs,
                OnHoldJobs = onHoldJobs,
                ClosedJobs = closedJobs,
                TotalCandidates = totalCandidates,
                AppliedCandidates = appliedCandidates,
                ShortlistedCandidates = shortlistedCandidates,
                InterviewCandidates = interviewCandidates,
                SelectedCandidates = selectedCandidates,
                RejectedCandidates = rejectedCandidates,
                OnHoldCandidates = onHoldCandidates,
                TotalInterviews = totalInterviews,
                ScheduledInterviews = scheduledInterviews,
                CompletedInterviews = completedInterviews,
                PendingInterviews = pendingInterviews,
                TotalOffers = totalOffers,
                PendingOffers = pendingOffers,
                AcceptedOffers = acceptedOffers,
                RejectedOffers = rejectedOffers
            };
        }

        private async Task<List<RecentJobDto>> GetRecentJobs(int count)
        {
            return await _context.Jobs
                .Include(j => j.CreatedByUser)
                .Include(j => j.CandidateJobs)
                .OrderByDescending(j => j.CreatedAt)
                .Take(count)
                .Select(j => new RecentJobDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Location = j.Location,
                    MinExperience = j.MinExperience,
                    Status = j.Status.ToString(),
                    CreatedAt = j.CreatedAt,
                    CreatedBy = j.CreatedByUser != null ? j.CreatedByUser.FullName : string.Empty,
                    AppliedCount = j.CandidateJobs.Count
                })
                .ToListAsync();
        }

        private async Task<List<RecentCandidateDto>> GetRecentCandidates(int count)
        {
            return await _context.Candidates
                .Include(c => c.User)
                .Include(c => c.UpdatedByUser)
                .Include(c => c.CandidateSkills)
                .ThenInclude(cs => cs.Skill)
                .OrderByDescending(c => c.CreatedAt)
                .Take(count)
                .Select(c => new RecentCandidateDto
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
        }

        private async Task<List<UpcomingInterviewDto>> GetUpcomingInterviews(int count)
        {
            return await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.User)
                .Include(i => i.Job)
                .Include(i => i.Interviewers)
                .ThenInclude(ir => ir.User)
                .Where(i => i.Status == "Scheduled" && i.ScheduledDate > DateTime.UtcNow)
                .OrderBy(i => i.ScheduledDate)
                .Take(count)
                .Select(i => new UpcomingInterviewDto
                {
                    Id = i.Id,
                    CandidateName = i.Candidate.User.FullName,
                    JobTitle = i.Job.Title,
                    InterviewType = i.InterviewType,
                    RoundNo = i.RoundNo,
                    ScheduledDate = i.ScheduledDate,
                    Interviewers = i.Interviewers.Select(ir => ir.User.FullName).ToList()
                })
                .ToListAsync();
        }

        private async Task<List<UpcomingInterviewDto>> GetUpcomingInterviewsForUser(int userId, int count)
        {
            return await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.User)
                .Include(i => i.Job)
                .Include(i => i.Interviewers)
                .ThenInclude(ir => ir.User)
                .Where(i => i.Status == "Scheduled" && i.ScheduledDate > DateTime.UtcNow && 
                           i.Interviewers.Any(ir => ir.UserId == userId))
                .OrderBy(i => i.ScheduledDate)
                .Take(count)
                .Select(i => new UpcomingInterviewDto
                {
                    Id = i.Id,
                    CandidateName = i.Candidate.User.FullName,
                    JobTitle = i.Job.Title,
                    InterviewType = i.InterviewType,
                    RoundNo = i.RoundNo,
                    ScheduledDate = i.ScheduledDate,
                    Interviewers = i.Interviewers.Select(ir => ir.User.FullName).ToList()
                })
                .ToListAsync();
        }

        private async Task<List<PendingTaskDto>> GetPendingTasks()
        {
            var tasks = new List<PendingTaskDto>();

            // Pending interviews
            var pendingInterviews = await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.User)
                .Include(i => i.Job)
                .Where(i => i.Status == "Scheduled" && i.ScheduledDate <= DateTime.UtcNow.AddDays(1))
                .Select(i => new PendingTaskDto
                {
                    Id = i.Id,
                    Type = "Interview",
                    Title = $"Interview with {i.Candidate.User.FullName}",
                    Description = $"{i.InterviewType} Round {i.RoundNo} for {i.Job.Title}",
                    DueDate = i.ScheduledDate,
                    Priority = i.ScheduledDate <= DateTime.UtcNow ? "High" : "Medium",
                    AssignedTo = "Interviewer"
                })
                .ToListAsync();

            tasks.AddRange(pendingInterviews);

            // Pending approvals
            var pendingApprovals = await _context.Users
                .Where(u => u.Status == "PendingApproval")
                .Select(u => new PendingTaskDto
                {
                    Id = u.Id,
                    Type = "Approval",
                    Title = $"Approve user: {u.FullName}",
                    Description = $"User {u.FullName} is waiting for approval",
                    DueDate = u.CreatedAt.AddDays(7),
                    Priority = "Medium",
                    AssignedTo = "Admin"
                })
                .ToListAsync();

            tasks.AddRange(pendingApprovals);

            return tasks.OrderBy(t => t.DueDate).Take(10).ToList();
        }

        private async Task<List<PendingTaskDto>> GetPendingTasksForUser(int userId)
        {
            var tasks = new List<PendingTaskDto>();

            // User's pending interviews
            var pendingInterviews = await _context.Interviews
                .Include(i => i.Candidate)
                .ThenInclude(c => c.User)
                .Include(i => i.Job)
                .Where(i => i.Status == "Scheduled" && i.ScheduledDate <= DateTime.UtcNow.AddDays(1) &&
                           i.Interviewers.Any(ir => ir.UserId == userId))
                .Select(i => new PendingTaskDto
                {
                    Id = i.Id,
                    Type = "Interview",
                    Title = $"Interview with {i.Candidate.User.FullName}",
                    Description = $"{i.InterviewType} Round {i.RoundNo} for {i.Job.Title}",
                    DueDate = i.ScheduledDate,
                    Priority = i.ScheduledDate <= DateTime.UtcNow ? "High" : "Medium",
                    AssignedTo = "You"
                })
                .ToListAsync();

            tasks.AddRange(pendingInterviews);

            return tasks.OrderBy(t => t.DueDate).Take(10).ToList();
        }

        private async Task<List<NotificationDto>> GetNotifications(int userId, int count)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(count)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Message = n.Message,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }
    }
}
