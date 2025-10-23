using Microsoft.EntityFrameworkCore;
using RecruitmentSystem.Api.Data;
using RecruitmentSystem.Api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Repositories
{
    public class CandidateRepository : ICandidateRepository
    {
        private readonly AppDbContext _context;

        public CandidateRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Candidate?> GetByUserIdAsync(int userId)
        {
            return await _context.Candidates
                .Include(c => c.User)
                .Include(c => c.CandidateSkills)
                .ThenInclude(cs => cs.Skill)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<Candidate?> GetByIdAsync(int id)
        {
            return await _context.Candidates
                .Include(c => c.User)
                .Include(c => c.CandidateSkills)
                .ThenInclude(cs => cs.Skill)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Candidate> CreateAsync(Candidate candidate)
        {
            _context.Candidates.Add(candidate);
            await _context.SaveChangesAsync();
            return candidate;
        }

        public async Task<Candidate?> UpdateAsync(Candidate candidate)
        {
            _context.Candidates.Update(candidate);
            await _context.SaveChangesAsync();
            return candidate;
        }

        public async Task<List<Job>> GetOpenJobsAsync(int page = 1, int pageSize = 10, string? location = null, int? experience = null, string? skills = null)
        {
            var query = _context.Jobs
                .Include(j => j.JobSkills)
                .ThenInclude(js => js.Skill)
                .Where(j => j.Status == JobStatus.Open);

            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(j => j.Location.Contains(location));
            }

            if (experience.HasValue)
            {
                // Parse MinExperience string to compare with experience years
                // Assuming MinExperience format like "2+ years" or "3-5 years"
                query = query.Where(j => ParseMinExperience(j.MinExperience) <= experience.Value);
            }

            if (!string.IsNullOrEmpty(skills))
            {
                var skillList = skills.Split(',').Select(s => s.Trim().ToLower()).ToList();
                query = query.Where(j => j.JobSkills.Any(js => skillList.Contains(js.Skill.Name.ToLower())));
            }

            return await query
                .OrderByDescending(j => j.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        private int ParseMinExperience(string minExperience)
        {
            if (string.IsNullOrEmpty(minExperience))
                return 0;

            // Extract number from strings like "2+ years", "3-5 years", "1 year"
            var numberPart = System.Text.RegularExpressions.Regex.Match(minExperience, @"\d+").Value;
            return int.TryParse(numberPart, out var result) ? result : 0;
        }

        public async Task<Document> AddDocumentAsync(Document document)
        {
            _context.Documents.Add(document);
            await _context.SaveChangesAsync();
            return document;
        }

        public async Task<List<Document>> GetDocumentsByCandidateIdAsync(int candidateId)
        {
            return await _context.Documents
                .Where(d => d.CandidateId == candidateId)
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();
        }

        public async Task<bool> DeleteDocumentAsync(int documentId, int candidateId)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId && d.CandidateId == candidateId);

            if (document == null)
            {
                return false;
            }

            // Delete the physical file if it exists
            if (System.IO.File.Exists(document.FilePath))
            {
                System.IO.File.Delete(document.FilePath);
            }

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VerifyDocumentAsync(int documentId, int verifiedByUserId)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
            {
                return false;
            }

            document.Verified = true;
            document.VerifiedAt = DateTime.UtcNow;
            document.VerifiedBy = verifiedByUserId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApplyForJobAsync(int candidateId, int jobId)
        {
            // Check if already applied
            var existingApplication = await _context.CandidateJobs
                .FirstOrDefaultAsync(cj => cj.CandidateId == candidateId && cj.JobId == jobId);

            if (existingApplication != null)
            {
                return false; // Already applied
            }

            var candidateJob = new CandidateJob
            {
                CandidateId = candidateId,
                JobId = jobId,
                AppliedDate = DateTime.UtcNow
            };

            _context.CandidateJobs.Add(candidateJob);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<CandidateJob>> GetAppliedJobsAsync(int candidateId)
        {
            return await _context.CandidateJobs
                .Include(cj => cj.Job)
                .ThenInclude(j => j.JobSkills)
                .ThenInclude(js => js.Skill)
                .Where(cj => cj.CandidateId == candidateId)
                .OrderByDescending(cj => cj.AppliedDate)
                .ToListAsync();
        }

        public async Task<Skill> GetOrCreateSkillAsync(string skillName)
        {
            var skill = await _context.Skills
                .FirstOrDefaultAsync(s => s.Name.ToLower() == skillName.ToLower());

            if (skill == null)
            {
                skill = new Skill
                {
                    Name = skillName
                };
                _context.Skills.Add(skill);
                await _context.SaveChangesAsync();
            }

            return skill;
        }
    }
}
