using RecruitmentSystem.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Services
{
    public interface IJobService
    {
        Task<List<JobDto>> GetAllJobsAsync();
        Task<JobDto?> GetJobByIdAsync(int id);
        Task<JobDto> CreateJobAsync(CreateJobDto createJobDto, int createdBy);
        Task<JobDto?> UpdateJobAsync(int id, UpdateJobDto updateJobDto);
        Task<bool> DeleteJobAsync(int id);
        Task<List<SkillDto>> GetAllSkillsAsync();
    }
}
