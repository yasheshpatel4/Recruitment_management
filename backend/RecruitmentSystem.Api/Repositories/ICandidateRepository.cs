using RecruitmentSystem.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Repositories
{
    public interface ICandidateRepository
    {
        Task<Candidate?> GetByUserIdAsync(int userId);
        Task<Candidate?> GetByIdAsync(int id);
        Task<Candidate> CreateAsync(Candidate candidate);
        Task<Candidate?> UpdateAsync(Candidate candidate);
        Task<List<Job>> GetOpenJobsAsync(int page = 1, int pageSize = 10, string? location = null, int? experience = null, string? skills = null);
        Task<Document> AddDocumentAsync(Document document);
        Task<List<Document>> GetDocumentsByCandidateIdAsync(int candidateId);
        Task<bool> DeleteDocumentAsync(int documentId, int candidateId);
        Task<bool> ApplyForJobAsync(int candidateId, int jobId);
        Task<List<CandidateJob>> GetAppliedJobsAsync(int candidateId);
        Task<Skill> GetOrCreateSkillAsync(string skillName);
    }
}
