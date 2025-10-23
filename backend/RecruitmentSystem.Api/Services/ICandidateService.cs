using RecruitmentSystem.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Services
{
    public interface ICandidateService
    {
        Task<Candidate?> GetCandidateByUserIdAsync(int userId);
        Task<Candidate?> GetCandidateByIdAsync(int id);
        Task<Candidate> CreateCandidateAsync(Candidate candidate);
        Task<Candidate?> UpdateCandidateAsync(Candidate candidate);
        Task<List<Job>> GetOpenJobsAsync(int page = 1, int pageSize = 10, string? location = null, int? experience = null, string? skills = null, string? search = null);
        Task<Document> UploadDocumentAsync(int candidateId, string documentType, string fileName, string filePath);
        Task<List<Document>> GetCandidateDocumentsAsync(int candidateId);
        Task<bool> DeleteDocumentAsync(int documentId, int candidateId);
        Task<bool> VerifyDocumentAsync(int documentId, int verifiedByUserId);
        Task<bool> ApplyForJobAsync(int candidateId, int jobId);
        Task<List<CandidateJob>> GetAppliedJobsAsync(int candidateId);
        Task<Skill> GetOrCreateSkillAsync(string skillName);
    }
}
