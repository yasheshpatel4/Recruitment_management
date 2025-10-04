using RecruitmentSystem.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Repositories
{
    public interface IJobRepository
    {
        Task<List<Job>> GetAllAsync();
        Task<Job?> GetByIdAsync(int id);
        Task<Job> CreateAsync(Job job);
        Task<Job?> UpdateAsync(Job job);
        Task<bool> DeleteAsync(int id);
        Task<List<Skill>> GetAllSkillsAsync();
    }
}
