using Microsoft.EntityFrameworkCore;
using RecruitmentSystem.Api.Data;
using RecruitmentSystem.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Repositories
{
    public class JobRepository : IJobRepository
    {
        private readonly AppDbContext _context;

        public JobRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Job>> GetAllAsync()
        {
            return await _context.Jobs
                .Include(j => j.CreatedByUser)
                .Include(j => j.JobSkills)
                .ThenInclude(js => js.Skill)
                .ToListAsync();
        }

        public async Task<Job?> GetByIdAsync(int id)
        {
            return await _context.Jobs
                .Include(j => j.CreatedByUser)
                .Include(j => j.JobSkills)
                .ThenInclude(js => js.Skill)
                .FirstOrDefaultAsync(j => j.Id == id);
        }

        public async Task<Job> CreateAsync(Job job)
        {
            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            if (job.JobSkills != null && job.JobSkills.Any())
            {
                foreach (var js in job.JobSkills)
                {
                    js.JobId = job.Id;
                }
                // Removed explicit AddRange for JobSkills to avoid double insertion
                // EF Core will handle JobSkills insertion via navigation property
                // _context.JobSkills.AddRange(job.JobSkills);
                // await _context.SaveChangesAsync();
            }

            return job;
        }

        public async Task<Job?> UpdateAsync(Job job)
        {
            _context.Jobs.Update(job);
            await _context.SaveChangesAsync();
            return job;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return false;

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Skill>> GetAllSkillsAsync()
        {
            return await _context.Skills.ToListAsync();
        }
    }
}
