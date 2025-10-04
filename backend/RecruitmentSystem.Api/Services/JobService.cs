using RecruitmentSystem.Api.Models;
using RecruitmentSystem.Api.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Services
{
    public class JobService : IJobService
    {
        private readonly IJobRepository _jobRepository;

        public JobService(IJobRepository jobRepository)
        {
            _jobRepository = jobRepository;
        }

        public async Task<List<JobDto>> GetAllJobsAsync()
        {
            var jobs = await _jobRepository.GetAllAsync();
            return jobs.Select(MapToJobDto).ToList();
        }

        public async Task<JobDto?> GetJobByIdAsync(int id)
        {
            var job = await _jobRepository.GetByIdAsync(id);
            return job != null ? MapToJobDto(job) : null;
        }

        public async Task<JobDto> CreateJobAsync(CreateJobDto createJobDto, int createdBy)
        {
            var job = new Job
            {
                Title = createJobDto.Title,
                Department = createJobDto.Department,
                Description = createJobDto.Description,
                MinExperience = createJobDto.MinExperience,
                Location = createJobDto.Location,
                Status = JobStatus.Open,
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow,
                JobSkills = createJobDto.Skills.Select(s => new JobSkill { SkillId = s.SkillId }).ToList()
            };

            var createdJob = await _jobRepository.CreateAsync(job);
            return MapToJobDto(createdJob);
        }

        public async Task<JobDto?> UpdateJobAsync(int id, UpdateJobDto updateJobDto)
        {
            var existingJob = await _jobRepository.GetByIdAsync(id);
            if (existingJob == null) return null;

            existingJob.Title = updateJobDto.Title;
            existingJob.Department = updateJobDto.Department;
            existingJob.Description = updateJobDto.Description;
            existingJob.MinExperience = updateJobDto.MinExperience;
            existingJob.Location = updateJobDto.Location;
            existingJob.Status = updateJobDto.Status;
            existingJob.ClosedReason = updateJobDto.ClosedReason;
            existingJob.SelectedCandidateId = updateJobDto.SelectedCandidateId;
            existingJob.UpdatedAt = DateTime.UtcNow;

            // Update skills
            existingJob.JobSkills = updateJobDto.SkillIds.Select(skillId => new JobSkill { JobId = id, SkillId = skillId }).ToList();

            var updatedJob = await _jobRepository.UpdateAsync(existingJob);
            return updatedJob != null ? MapToJobDto(updatedJob) : null;
        }

        public async Task<bool> DeleteJobAsync(int id)
        {
            return await _jobRepository.DeleteAsync(id);
        }

        public async Task<List<SkillDto>> GetAllSkillsAsync()
        {
            var skills = await _jobRepository.GetAllSkillsAsync();
            return skills.Select(s => new SkillDto { Id = s.Id, Name = s.Name }).ToList();
        }

        private static JobDto MapToJobDto(Job job)
        {
            return new JobDto
            {
                Id = job.Id,
                Title = job.Title,
                Department = job.Department,
                Description = job.Description,
                MinExperience = job.MinExperience,
                Location = job.Location,
                Status = job.Status,
                CreatedBy = job.CreatedBy,
                CreatedByName = job.CreatedByUser?.FullName ?? string.Empty,
                CreatedAt = job.CreatedAt,
                UpdatedAt = job.UpdatedAt,
                ClosedReason = job.ClosedReason,
                SelectedCandidateId = job.SelectedCandidateId,
                Skills = job.JobSkills?.Select(js => new SkillDto { Id = js.Skill.Id, Name = js.Skill.Name }).ToList() ?? new List<SkillDto>()
            };
        }
    }
}
