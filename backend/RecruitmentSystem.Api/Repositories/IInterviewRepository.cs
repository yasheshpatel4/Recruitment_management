using RecruitmentSystem.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Repositories
{
    public interface IInterviewRepository
    {
        Task<Interview?> GetByIdAsync(int id);
        Task<List<Interview>> GetByCandidateIdAsync(int candidateId);
        Task<List<Interview>> GetAllAsync();
        Task<Interview> CreateAsync(Interview interview);
        Task<Interview?> UpdateAsync(Interview interview);
        Task<bool> DeleteAsync(int id);
        Task<List<Interview>> GetInterviewsByJobIdAsync(int jobId);
        Task<List<Interview>> GetInterviewsByInterviewerIdAsync(int interviewerId);
        Task<bool> UpdateInterviewStatusAsync(int interviewId, string status);
        Task<Feedback> AddFeedbackAsync(Feedback feedback);
        Task<List<Feedback>> GetFeedbacksByInterviewIdAsync(int interviewId);
    }
}
