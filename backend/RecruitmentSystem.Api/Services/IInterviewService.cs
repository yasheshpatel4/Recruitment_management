using RecruitmentSystem.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RecruitmentSystem.Api.Services
{
    public interface IInterviewService
    {
        Task<InterviewDto?> GetInterviewByIdAsync(int id);
        Task<List<InterviewDto>> GetInterviewsByCandidateIdAsync(int candidateId);
        Task<List<InterviewDto>> GetAllInterviewsAsync();
        Task<InterviewDto> ScheduleInterviewAsync(ScheduleInterviewDto dto);
        Task<InterviewDto?> UpdateInterviewStatusAsync(int interviewId, UpdateInterviewStatusDto dto);
        Task<Feedback> AddInterviewFeedbackAsync(int interviewId, InterviewFeedbackDto dto);
        Task<List<FeedbackDto>> GetInterviewFeedbacksAsync(int interviewId);
        Task<bool> DeleteInterviewAsync(int id);
        Task<List<InterviewDto>> GetInterviewsByJobIdAsync(int jobId);
        Task<List<InterviewDto>> GetInterviewsByInterviewerIdAsync(int interviewerId);
    }
}
