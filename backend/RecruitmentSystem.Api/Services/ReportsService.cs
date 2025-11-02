using RecruitmentSystem.Api.Models;
using RecruitmentSystem.Api.Repositories;

namespace RecruitmentSystem.Api.Services
{
    public class ReportsService : IReportsService
    {
        private readonly ICandidateRepository _candidateRepository;
        private readonly IJobRepository _jobRepository;
        private readonly IInterviewRepository _interviewRepository;

        public ReportsService(
            ICandidateRepository candidateRepository,
            IJobRepository jobRepository,
            IInterviewRepository interviewRepository)
        {
            _candidateRepository = candidateRepository;
            _jobRepository = jobRepository;
            _interviewRepository = interviewRepository;
        }

        public async Task<ReportsOverviewDto> GetOverviewAsync()
        {
            // For now, we'll use simplified data aggregation
            // In a real implementation, you'd query the database directly
            var candidates = new List<Candidate>(); // Placeholder
            var jobs = await _jobRepository.GetAllAsync();
            var interviews = await _interviewRepository.GetAllAsync();

            var totalApplications = candidates.Count();
            var interviewedCandidates = interviews.Select(i => i.CandidateId).Distinct().Count();
            var interviewRate = totalApplications > 0 ? (decimal)interviewedCandidates / totalApplications * 100 : 0;

            var hiredCandidates = candidates.Count(c => c.Status == "Selected");
            var hireRate = totalApplications > 0 ? (decimal)hiredCandidates / totalApplications * 100 : 0;

            // Calculate average time to hire (simplified - in days)
            var timeToHire = 28; // Placeholder - would need actual hire dates

            // Source analysis (simplified - would need source tracking)
            var sourceAnalysis = new List<SourceAnalysisDto>
            {
                new SourceAnalysisDto { Source = "LinkedIn", Percentage = 45 },
                new SourceAnalysisDto { Source = "Company Website", Percentage = 30 },
                new SourceAnalysisDto { Source = "Referrals", Percentage = 15 },
                new SourceAnalysisDto { Source = "Other", Percentage = 10 }
            };

            // Recent activity (simplified)
            var recentActivity = new List<RecentActivityDto>
            {
                new RecentActivityDto {
                    Type = "application",
                    Description = "New application received for Senior Developer position",
                    TimeAgo = "2 hours ago"
                },
                new RecentActivityDto {
                    Type = "interview",
                    Description = "Interview scheduled with John Doe",
                    TimeAgo = "4 hours ago"
                },
                new RecentActivityDto {
                    Type = "shortlist",
                    Description = "Candidate shortlisted for Frontend Developer role",
                    TimeAgo = "1 day ago"
                }
            };

            return new ReportsOverviewDto
            {
                TotalApplications = totalApplications,
                InterviewRate = Math.Round(interviewRate, 1),
                HireRate = Math.Round(hireRate, 1),
                TimeToHire = timeToHire,
                SourceAnalysis = sourceAnalysis,
                RecentActivity = recentActivity
            };
        }

        public async Task<IEnumerable<CandidateStatusDto>> GetCandidatesByStatusAsync()
        {
            // Placeholder implementation - would need a GetAllCandidates method in repository
            var candidates = new List<Candidate>(); // Placeholder
            var statusGroups = candidates.GroupBy(c => c.Status ?? "Unknown")
                .Select(g => new CandidateStatusDto
                {
                    Status = g.Key,
                    Count = g.Count(),
                    Percentage = candidates.Any() ? Math.Round((decimal)g.Count() / candidates.Count() * 100, 1) : 0
                })
                .OrderByDescending(s => s.Count);

            return statusGroups;
        }

        public async Task<IEnumerable<JobDepartmentDto>> GetJobsByDepartmentAsync()
        {
            var jobs = await _jobRepository.GetAllAsync();
            var departmentGroups = jobs.GroupBy(j => j.Department ?? "Unknown")
                .Select(g => new JobDepartmentDto
                {
                    Department = g.Key,
                    Count = g.Count(),
                    Percentage = jobs.Any() ? Math.Round((decimal)g.Count() / jobs.Count() * 100, 1) : 0
                })
                .OrderByDescending(d => d.Count);

            return departmentGroups;
        }

        public async Task<IEnumerable<InterviewTrendDto>> GetInterviewTrendsAsync()
        {
            var interviews = await _interviewRepository.GetAllAsync();

            // Group by month and year
            var trends = interviews
                .GroupBy(i => new { i.ScheduledDate.Year, i.ScheduledDate.Month })
                .Select(g => new InterviewTrendDto
                {
                    Year = g.Key.Year,
                    Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    Count = g.Count()
                })
                .OrderBy(t => t.Year)
                .ThenBy(t => DateTime.ParseExact(t.Month, "MMM yyyy", null).Month);

            return trends;
        }
    }
}
