using RecruitmentSystem.Api.Models;

namespace RecruitmentSystem.Api.Services
{
    public interface IReportsService
    {
        Task<ReportsOverviewDto> GetOverviewAsync();
        Task<IEnumerable<CandidateStatusDto>> GetCandidatesByStatusAsync();
        Task<IEnumerable<JobDepartmentDto>> GetJobsByDepartmentAsync();
        Task<IEnumerable<InterviewTrendDto>> GetInterviewTrendsAsync();
    }
}
