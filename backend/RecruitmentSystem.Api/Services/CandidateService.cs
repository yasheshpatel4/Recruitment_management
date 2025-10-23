using RecruitmentSystem.Api.Models;
using RecruitmentSystem.Api.Repositories;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Services
{
    public class CandidateService : ICandidateService
    {
        private readonly ICandidateRepository _candidateRepository;

        public CandidateService(ICandidateRepository candidateRepository)
        {
            _candidateRepository = candidateRepository;
        }

        public async Task<Candidate?> GetCandidateByUserIdAsync(int userId)
        {
            return await _candidateRepository.GetByUserIdAsync(userId);
        }

        public async Task<Candidate?> GetCandidateByIdAsync(int id)
        {
            return await _candidateRepository.GetByIdAsync(id);
        }

        public async Task<Candidate> CreateCandidateAsync(Candidate candidate)
        {
            return await _candidateRepository.CreateAsync(candidate);
        }

        public async Task<Candidate?> UpdateCandidateAsync(Candidate candidate)
        {
            return await _candidateRepository.UpdateAsync(candidate);
        }

        public async Task<List<Job>> GetOpenJobsAsync(int page = 1, int pageSize = 10, string? location = null, int? experience = null, string? skills = null)
        {
            return await _candidateRepository.GetOpenJobsAsync(page, pageSize, location, experience, skills);
        }

        public async Task<Document> UploadDocumentAsync(int candidateId, string documentType, string fileName, string filePath)
        {
            var document = new Document
            {
                CandidateId = candidateId,
                DocumentType = documentType,
                FilePath = filePath,
                UploadedAt = DateTime.UtcNow
            };

            return await _candidateRepository.AddDocumentAsync(document);
        }

        public async Task<List<Document>> GetCandidateDocumentsAsync(int candidateId)
        {
            return await _candidateRepository.GetDocumentsByCandidateIdAsync(candidateId);
        }

        public async Task<bool> DeleteDocumentAsync(int documentId, int candidateId)
        {
            return await _candidateRepository.DeleteDocumentAsync(documentId, candidateId);
        }

        public async Task<bool> ApplyForJobAsync(int candidateId, int jobId)
        {
            return await _candidateRepository.ApplyForJobAsync(candidateId, jobId);
        }

        public async Task<List<CandidateJob>> GetAppliedJobsAsync(int candidateId)
        {
            return await _candidateRepository.GetAppliedJobsAsync(candidateId);
        }

        public async Task<Skill> GetOrCreateSkillAsync(string skillName)
        {
            return await _candidateRepository.GetOrCreateSkillAsync(skillName);
        }
    }
}
